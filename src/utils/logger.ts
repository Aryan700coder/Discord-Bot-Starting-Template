import chalk from 'chalk';
import moment from 'moment';
import ILogger from '../typings/interfaces/ILogger';
import LogLevel from '../typings/enums/logLevel';
import ILoggerOptions from '../typings/interfaces/ILoggerOptions';

export default class Logger implements ILogger {
    private options: ILoggerOptions;
    private separator = chalk.magenta.bold(" :: ");

    constructor(options?: ILoggerOptions) {
        this.options = options || {
            debug: true,
            success: true,
            error: true,
            info: true,
            prefix: "BOT TEMPLATE"
        };
    }

    private log(level: LogLevel, message: any, color: chalk.Chalk) {
        const date = chalk.gray(`[${moment().format('DD-MM-YYYY')}]`);
        const time = chalk.gray(`[${moment().format('HH:mm:ss')}]`);
        const formattedMessage = color.dim(message);
        console.log(`${date} ${time} ${chalk.yellow(`[${this.options.prefix}]`)} ${color(`[${level}]`)}${this.separator}${formattedMessage}`);

    }

    info(message: any): void {
        if (this.options.info) {
            this.log(LogLevel.INFO, message, chalk.cyan);
        } 
    }

    error(message: Error | any): void {
        if (this.options.error) {
            this.log(LogLevel.ERROR, message.stack ? message.stack : message.message, chalk.redBright);
        }
    }

    success(message: any): void {
        if (this.options.success) {
            this.log(LogLevel.SUCCESS, message, chalk.greenBright);
        }
    }

    debug(message: any): void {
        if (this.options.debug) {
            this.log(LogLevel.DEBUG, message, chalk.gray);
        }
    }
}