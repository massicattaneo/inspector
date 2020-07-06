export function apiReplay(...args) {
    const next = args[args.length - 1];
    const [threadName] = args;
    if (
        typeof threadName === 'string' &&
        threadName.startsWith('api/') &&
        !threadName.startsWith('api/reload') &&
        !threadName.startsWith('api/take-screen-shoot') &&
        !threadName.startsWith('api/insert-interaction') &&
        !threadName.startsWith('api/replay-insert-interaction') &&
        this.params.isReplaying
    ) {
        return;
    }
    next(...args);
}
