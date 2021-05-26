// !!!!!!!!!!!!!! Always import first !!!!!!!!!!!!!!
import 'reflect-metadata';
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import express from 'express';
import { createConnection, EntityNotFoundError } from 'typeorm';
import bodyParser from 'body-parser';
import { isHttpError } from 'http-errors';
import cors from 'cors';
import { authRouter } from './routes/authRouter';
import logger from './logger';
import { appConfig, dbConfig } from './configs/appConfig';
import { toolsRouter } from './routes/toolsRouter';

(async (): Promise<any> => {
    await createConnection({
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        entities: ['src/models/**/*.ts'],
        synchronize: true,
        logging: 'all',
        database: dbConfig.name,
    });
    const app = express();

    app.use(
        bodyParser.urlencoded({
            inflate: true,
            limit: '1mb',
        }),
    );

    app.set('views', `${__dirname}/views`);
    logger.debug(`index: views: ${__dirname}/views`);
    app.set('view engine', 'twig');

    // This section is optional and can be used to configure twig.
    app.set('twig options', {
        allow_async: true, // Allow asynchronous compiling
        strict_variables: false,
    });

    const corsOptions = {
        origin: '*',
        methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
        allowedHeaders: 'Authorization, Origin, X-Requested-With, Content-Type, Accept',
        credentials: true,
        optionsSuccessStatus: 200,
    };
    app.use(cors(corsOptions));

    app.use('', authRouter);
    app.use('', toolsRouter);

    // This is the last middleware in chain. It handles all of errors caught in application.
    app.use(
        (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction): express.Response => {
            if (isHttpError(err)) {
                return res.status(err.statusCode).json({
                    message: err.message,
                });
            }

            if (err instanceof EntityNotFoundError) {
                return res.status(404).json({
                    message: err.message,
                });
            }

            return res.status(500).json({
                message: err.message,
            });
        },
    );

    app.listen(appConfig.port, (): void => {
        logger.info('server started');
    });
})();
