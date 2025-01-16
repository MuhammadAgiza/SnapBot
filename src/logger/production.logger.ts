import * as path from 'path';
import * as winston from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';

export default function createProductionLogger() {


    const myFormat = winston.format.combine(
        winston.format.timestamp({
            format: 'HH:mm:ss'
        }),
        winston.format.json()
    );

    const getPath = (addDays: number = 0): string => {
        const d = new Date();
        (addDays == 0) || d.setDate(d.getDate() + addDays);
        const [year, month, day] = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')];
        return path.join(path.resolve("./../logs"), `/${year}/${month}/${day}`);
    }

    const transport: DailyRotateFile = new DailyRotateFile({
        filename: '%DATE%.log',
        dirname: getPath(),
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '20m',
    });

    transport.on('new', async function (file) {
    });

    return winston.createLogger({
        level: 'info',
        format: myFormat,
        transports: [
            transport
        ],
    });

}