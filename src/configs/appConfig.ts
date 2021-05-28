import path from 'path';

export const appConfig = {
    name: process.env.APP_NAME,
    port: +(process.env.APP_PORT || 8080),
    url: process.env.APP_URL,
    secret: Buffer.from(process.env.APP_SECRET!, 'base64').toString('binary'),
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtAccessExpire: process.env.JWT_ACCESS_EXPIRE || '1h',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '1d',
    jwtAutoRefresh: /true/i.test(process.env.JWT_AUTO_REFRESH || 'false'),
    jwtSessions: /true/i.test(process.env.JWT_SESSIONS || 'false'),
    bcryptRounds: +(process.env.BCRYPT_ROUNDS || '10'),

    authEmailVerifyUrl: process.env.AUTH_EMAIL_VERIFY_URL,
    authPassResetUrl: process.env.AUTH_PASS_RESET_URL,
    authEmailVerifyUrlExpires: +(process.env.AUTH_EMAIL_VERIFY_EXPIRES || 86400),
    authPasswordResetExpires: +(process.env.AUTH_PASS_RESET_EXPIRES || 60),
    authDebug: /true/i.test(process.env.AUTH_DEBUG || 'false'),

    baseDir: path.join(__dirname, '..'),
    rootDir: path.join(__dirname, '../..'),
};

export const dbConfig = {
    connectionName: process.env.DB_CONNECTION_NAME || 'default',
};

const logDir = process.env.LOG_DIR || 'logs';

export const logConfig = {
    file: {
        level: process.env.LOG_FILE_LEVEL || 'info',
        dirname: logDir,
        filename: process.env.LOG_FILENAME || 'app-%DATE%.log',
        datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD-HH',
        zippedArchive: process.env.LOG_ZIPPED_ARCHIVE === 'true',
        maxsize: +(process.env.LOG_FILE_MAXSIZE || 2097152),
        maxFiles: process.env.LOG_MAX_FILES || '7d',
    },
    cons: {
        level: process.env.LOG_CONSOLE_LEVEL || 'debug',
    },
    exceptionHandler: {
        // filename: path.join(logDir, (process.env.LOG_EXCEPTION_HANDLER_FILENAME || 'exceptions.log')),
        filename: process.env.LOG_EXCEPTION_HANDLER_FILENAME || 'exceptions.log',
    },
};

export const mailConfig = {
    debug: process.env.MAIL_DEBUG === 'true',
    streamTransporterConfig: {
        streamTransport: true,
        newline: 'windows',
        buffer: true,
    },
    mailTransporterConfig: {
        service: process.env.MAIL_SERVICE || 'Hotmail',
        auth: {
            user: process.env.MAIL_LOGIN,
            pass: process.env.MAIL_PASSWORD,
        },
    },
    fromName: process.env.MAIL_FROM_NAME || false,
    fromAddr: process.env.MAIL_FROM_ADDR,
};
