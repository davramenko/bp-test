import {logConfig} from "./configs/appConfig";
import winston from "winston";
import 'winston-daily-rotate-file';

let transports = [];
if (logConfig.file) {
    const format = { format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf((i) => {
                return `${i.timestamp} [${i.level}] ${i.message}`;
            })
        )};
    transports.push(new winston.transports.DailyRotateFile(
        {
            ...logConfig.file, ...format
        }));
    //console.log('Logger filename: ' + logConfig.file.filename);
}
if (logConfig.cons) {
    const format =  { format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    )};
    transports.push(new winston.transports.Console({
        ...logConfig.cons, ...format
    }));
}

const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports,
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' })
    ],
    exitOnError: false
});

export default logger;
