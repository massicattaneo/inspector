const { Middleware } = require('./Middleware');

/** Thread */
let pointer = 1;

function getFunction(statements, statement) {
    if (statement instanceof Function) {
        return statement;
    }
    return statements[statement];
}

function Thread(statements = {}, sharedContext = {}, { name = pointer++, clean = [] } = {}) {
    const thread = {};
    const middleware = Middleware();
    const context = {
        sharedContext,
        thread,
        threadName: `THREAD ${name}`
    };

    thread.before = middleware.before();
    thread.main = middleware.use(
        (statement, ...params) => params.pop()(getFunction(statements, statement).call(context, ...params)),
        context
    );
    thread.extend = (...args) => Object.assign(context, ...args);
    thread.exit = err => {
        if (err && process) process.exit();
        if (err) throw new Error(err);
        return false;
    };
    thread.error = e => e;
    thread.getStatements = () => statements;
    thread.cleanContext = () => {
        const ctx = { ...context };
        delete ctx.sharedContext;
        delete ctx.thread;
        delete ctx.threadName;
        clean.forEach(item => delete ctx[item]);
        return ctx;
    };

    return thread;
}

module.exports = { Thread };
