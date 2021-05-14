import express from 'express';
import bcrypt from 'bcrypt';
import {Unauthorized, Forbidden, BadRequest, ServiceUnavailable, NotImplemented} from 'http-errors';
import { LoginRequestBody } from '../interfaces/request/body/LoginRequestBody';
import {getRepository} from "typeorm";
import {User} from "../models/User";
import jwt from 'jsonwebtoken';
import {appConfig} from "../configs/appConfig";
import {RegistrationRequestBody} from "../interfaces/request/body/RegistrationRequestBody";
import logger from "../logger";
import {Session} from "../models/Session";
import {timespan} from "../helpers/timespan";
import {LogoutRequestQuery} from "../interfaces/request/query/LogoutRequestQuery";

interface TokenData {
    userId: number;
    type: 'access' | 'refresh';
    sesId?: string;
}

export async function logIn (req: express.Request, res: express.Response, next: express.NextFunction) {
    const reqBody: LoginRequestBody = req.body;

    const foundUser = await getRepository(User).findOne({
        userIdentifier: reqBody.userIdentifier,
    });
    if (!foundUser) {
        throw new Unauthorized('Users is not found by this identifier and password combination');
    }
    if (!(await bcrypt.compare(reqBody.password, foundUser.password!))) {
        throw new Unauthorized('Users is not found by this identifier and password combination');
    }

    let accessToken = null;
    let refreshToken = null;
    if (appConfig.jwtSessions) {
        const createdSession = await getRepository(Session).create({
            userId: foundUser.id,
            expiresAt: new Date(await timespan(appConfig.jwtAccessExpire) * 1000),
        });
        await createdSession.save();

        accessToken = jwt.sign({
            userId: foundUser.id,
            type: 'access',
            sesId: createdSession.id,
        }, appConfig.jwtSecret, {
            expiresIn: appConfig.jwtAccessExpire,
        });
        refreshToken = jwt.sign({
            userId: foundUser.id,
            type: 'refresh',
            sesId: createdSession.id,
        }, appConfig.jwtSecret, {
            expiresIn: appConfig.jwtRefreshExpire,
        });
    } else {
        accessToken = jwt.sign({
            userId: foundUser.id,
            type: 'access',
        }, appConfig.jwtSecret, {
            expiresIn: appConfig.jwtAccessExpire,
        });
        refreshToken = jwt.sign({
            userId: foundUser.id,
            type: 'refresh',
        }, appConfig.jwtSecret, {
            expiresIn: appConfig.jwtRefreshExpire,
        });
    }
    return res.json({
        accessToken,
        refreshToken,
    });
}

export async function refresh (req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.header('authorization');

    if (!authHeader) {
        throw new Unauthorized('No auth header');
    }

    //const [,token] = authHeader.split(' ');
    const regexp = new RegExp('^Bearer\\s+(\\S+)$');
    let matches = await authHeader.match(regexp);
    if (matches) {
        const token = matches[1];
        let payload: {
            userId: number;
            type: 'access' | 'refresh';
            sesId?: string;
        };

        try {
            payload = jwt.verify(token, appConfig.jwtSecret) as any;
        } catch (e) {
            throw new Forbidden('Bad token');
        }
        if (payload.type !== 'refresh') {
            throw new Forbidden('Bad token type');
        }

        let accessToken = null;
        let refreshToken = null;
        if (appConfig.jwtSessions) {
            const foundSession = await getRepository(Session).findOne(payload.sesId);
            if (!foundSession) {
                throw new Forbidden('Cannot find session by ID');
            }
            if (foundSession.expiresAt.getTime() < new Date().getTime()) {
                await getRepository(Session).delete({
                    id: payload.sesId,
                });
                throw new Forbidden('Session has expired');
            }
            const updateInfo = await getRepository(Session).update({
                id: payload.sesId,
            }, {
                expiresAt: new Date(await timespan(appConfig.jwtAccessExpire) * 1000),
            });
            if (updateInfo.affected !== 1) {
                throw new Forbidden('Cannot update session info');
            }

            accessToken = jwt.sign({
                userId: payload.userId,
                type: 'access',
                sesId: payload.sesId,
            }, appConfig.jwtSecret, {
                expiresIn: appConfig.jwtAccessExpire,
            });
            refreshToken = jwt.sign({
                userId: payload.userId,
                type: 'refresh',
                sesId: payload.sesId,
            }, appConfig.jwtSecret, {
                expiresIn: appConfig.jwtRefreshExpire,
            });
        } else {
            accessToken = jwt.sign({
                userId: payload.userId,
                type: 'access',
            }, appConfig.jwtSecret, {
                expiresIn: appConfig.jwtAccessExpire,
            });
            refreshToken = jwt.sign({
                userId: payload.userId,
                type: 'refresh',
            }, appConfig.jwtSecret, {
                expiresIn: appConfig.jwtRefreshExpire,
            });
        }
        return res.json({
            accessToken,
            refreshToken,
        });
    } else {
        throw new Unauthorized('Invalid auth header');
    }
}

export async function logout (req: express.Request, res: express.Response, next: express.NextFunction) {
    const reqQuery: LogoutRequestQuery = req.query as any;

    if (req.sesId) {
        let delInfo = null;
        if (!reqQuery.all || reqQuery.all === 'false') {
            logger.debug('authController@logout: deleting just one session: ' + req.sesId);
            delInfo = await getRepository(Session).delete({
                id: req.sesId,
            });
        } else {
            logger.debug('authController@logout: deleting all sessions for user ID=' + req.user.id);
            delInfo = await getRepository(Session).delete({
                userId: req.user.id,
            });
        }
        logger.debug('authController@logout: # of sessions deleted: ' + delInfo.affected);
        // @ts-ignore
        if (delInfo.affected < 1) {
            throw new ServiceUnavailable('Cannot stop session(s)');
        }
    }
    res.status(204).send();
}

export async function getMe (req: express.Request, res: express.Response, next: express.NextFunction) {
    return res.json(
        req.user,
    );
}

async function validateEmail(email: string) : Promise<boolean> {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}

async function validatePhone(phone: string) : Promise<boolean> {
    const regex = /^(?:\+[0-9]{2})?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return regex.test(phone);
}

export async function register(req: express.Request, res: express.Response, next: express.NextFunction) {
    const reqBody: RegistrationRequestBody = req.body;

    logger.info('authController@register: run');
    if (!reqBody.password) {
        throw new BadRequest('Password is missing');
    }
    if (reqBody.password !== reqBody.passwordConfirmation) {
        throw new BadRequest('Password confirmation does not match');
    }

    const userWithSameIdentifier = await getRepository(User).findOne({
        userIdentifier: reqBody.userIdentifier,
    });

    if (userWithSameIdentifier) {
        throw new BadRequest('This user identifier is already taken');
    }

    let idType : 'email' | 'phone' | null = null;
    if (await validateEmail(reqBody.userIdentifier)) {
        idType = 'email';
    } else if (await validatePhone(reqBody.userIdentifier)) {
        idType = 'phone';
    } else {
        throw new BadRequest('Invalid user identifier');
    }
    const createdUser = await getRepository(User).create({
        userIdentifier: reqBody.userIdentifier,
        idType: idType,
        password: await bcrypt.hash(reqBody.password, appConfig.bcryptRounds),
    });
    await createdUser.save();
    return res.json(createdUser);
}
