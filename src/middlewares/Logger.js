import { Middleware } from '../core/Middleware';

export const Logger = () => {
    const middleware = Middleware();

    const logger = {
        consoleLog: true,
        beforeLog: middleware.before(),
        log: middleware.use((...args) => {
            const next = args.pop();
            logger.consoleLog && window.console.log('INSPECTOR: ', ...args);
            next(...args);
        }),
        warn: middleware.use((...args) => {
            const next = args.pop();
            logger.consoleLog && window.console.warn('INSPECTOR: ', ...args);
            next(...args);
        }),
        error: middleware.use((...args) => {
            const next = args.pop();
            logger.consoleLog && window.console.error('INSPECTOR: ', ...args);
            next(...args);
        })
    };

    window.addEventListener('error', function myErrorHandler(errorMsg) {
        logger.error('WINDOW ERROR', JSON.stringify(errorMsg));
        return true;
    });

    return logger;
};
