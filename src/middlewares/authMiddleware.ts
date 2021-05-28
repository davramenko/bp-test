import express from 'express';
import { Forbidden, Unauthorized } from 'http-errors';
import jwt from 'jsonwebtoken';
import { appConfig } from '../configs/appConfig';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { timespan } from '../helpers/timespan';
import { getRepository } from '../helpers/repo';

function isScalar(v: any): boolean {
    return typeof v !== 'object' && !Array.isArray(v);
}

async function transform(body: any, user: User, req: express.Request, _res: express.Response): Promise<any> {
    if (req.sesId) {
        // eslint-disable-next-line no-param-reassign
        body.updatedAccessToken = jwt.sign(
            {
                userId: user.id,
                type: 'access',
                sesId: req.sesId,
            },
            appConfig.jwtSecret,
            {
                expiresIn: appConfig.jwtAccessExpire,
            },
        );
    } else {
        // eslint-disable-next-line no-param-reassign
        body.updatedAccessToken = jwt.sign(
            {
                userId: user.id,
                type: 'access',
            },
            appConfig.jwtSecret,
            {
                expiresIn: appConfig.jwtAccessExpire,
            },
        );
    }
    return body;
}

export async function authorizeUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
): Promise<any> {
    const authHeader = req.header('authorization');

    if (!authHeader) {
        throw new Unauthorized('No auth header');
    }

    const regexp = new RegExp('^Bearer\\s+(\\S+)$');
    const matches = await authHeader.match(regexp);
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
        if (payload.type !== 'access') {
            throw new Forbidden('Bad token type');
        }

        const user = await getRepository(User).findOne({
            id: payload.userId,
        });
        if (!user) {
            throw new Forbidden('User does not exist');
        }
        req.user = user as User;
        if (appConfig.jwtSessions) {
            if (payload.sesId) {
                const session = await getRepository(Session).findOne({
                    id: payload.sesId,
                });
                if (!session) {
                    throw new Forbidden('Cannot find session by ID');
                }
                if (session.expiresAt.getTime() < new Date().getTime()) {
                    await getRepository(Session).delete({
                        id: payload.sesId,
                    });
                    throw new Forbidden('Session has expired');
                }
                req.sesId = payload.sesId;
                const updateInfo = await getRepository(Session).update(
                    {
                        id: payload.sesId,
                    },
                    {
                        expiresAt: new Date((await timespan(appConfig.jwtAccessExpire)) * 1000),
                    },
                );
                if (updateInfo.affected !== 1) {
                    throw new Forbidden('Cannot update session info');
                }
            } else {
                throw new Forbidden('Session ID is undefined');
            }
        }

        if (appConfig.jwtAutoRefresh && !/auth\/(?:logout|login|refresh)/i.test(req.path)) {
            const original = res.json;

            // @ts-ignore
            res.json = function jsonHandler(json: any): any {
                const originalJson = json;
                res.json = original;
                if (res.headersSent) return res;

                // Run the `transform`
                transform(json, user as User, req, res)
                    .then((trans_res): any => {
                        // eslint-disable-next-line no-param-reassign
                        json = trans_res;
                    })
                    .catch((_err): any => {
                        return res;
                    });
                if (res.headersSent) return res;

                // If no returned value from `transform`, then assume json has been mucked with.
                if (json === undefined)
                    // eslint-disable-next-line no-param-reassign
                    json = originalJson;

                // If null, then 204 No Content
                if (json === null) return res.status(204).end();

                // If transformed scalar value, then text/plain
                if (originalJson !== json && isScalar(json)) {
                    res.set('content-type', 'text/plain');
                    return res.send(String(json));
                }
                // @ts-ignore
                return original.call(this, json);
            };
        }
        return next();
    }
    throw new Unauthorized(`Invalid auth header: [${authHeader}]`);
}
