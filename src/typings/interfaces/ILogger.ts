interface ILogger {
    info(message: string): void;
    error(message: string): void;
    success(message: string): void;
    debug(message: string): void;
}

export default ILogger;