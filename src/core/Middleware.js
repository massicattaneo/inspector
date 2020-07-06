const { Stack } = require('./Stack');

function Middleware({ autoProceedToAfter = false } = {}) {
    const beforeFn = [];
    const afterFn = [];

    const before = () => md => {
        const length = beforeFn.push(md);
        return () => beforeFn.splice(length - 1, 1);
    };

    const after = () => md => {
        const length = afterFn.push(md);
        return () => afterFn.splice(length - 1, 1);
    };

    const timestamps = () => {
        beforeFn.push(function(...args) {
            const next = args.pop();
            this.timestamps = { start: Date.now() };
            next(...args);
        });
        afterFn.push(function(...args) {
            const next = args.pop();
            this.timestamps.end = Date.now();
            this.timestamps.duration = this.timestamps.end - this.timestamps.start;
            next(...args);
        });
    };

    const use = (callback = new Function(), context = {}) => {
        return function(...args) {
            let result;
            const stack = Stack(context);
            stack.add(next => next(...args));
            beforeFn.forEach(stack.add);
            stack.add(function(...args) {
                const next = args.pop();
                result = callback(...args, next);
                autoProceedToAfter && next(...args);
            });
            afterFn.forEach(stack.add);
            stack.run();
            return (lastFn = event => event) =>
                stack.run(function(...args) {
                    lastFn.call(this, ...args);
                    return result;
                });
        };
    };

    return {
        timestamps,
        before,
        after,
        use
    };
}

module.exports = { Middleware };
