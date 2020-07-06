const { EventEmitter } = require('./EventEmitter');
const { Middleware } = require('./Middleware');

function Scheduler() {
    const list = [];
    const original = [];
    let actualIndex = 0;
    const disposers = [];
    const emitter = EventEmitter();
    const middleware = Middleware();

    function schedule(array) {
        actualIndex = 0;
        original.length = 0;
        while (list.length) {
            list.shift().reject();
        }

        original.push(...array);
        list.push(
            ...array.map((item, index) => {
                const { scheduledAction } = item;
                const timestamps = item.timestamps || {};
                const timeouts = [];

                function getTimeout(args, promiseResolve) {
                    return setTimeout(() => {
                        scheduledAction(...args);
                        if (original[index + 1] && original[index + 1].autoResolve) {
                            timeouts.push(
                                setTimeout(function () {
                                    resolve(index + 1);
                                }, original[index + 1].timestamps.start - item.timestamps.end)
                            );
                        }
                        promiseResolve(item);
                    }, item.timestamps.duration);
                }

                return {
                    resolve: (...args) =>
                        new Promise(promiseResolve => {
                            actualIndex++;
                            timestamps.resolvedAt = Date.now();
                            timeouts.push(getTimeout(args, promiseResolve));
                        }),
                    reject: () => {
                        timeouts.forEach(clearTimeout);
                    }
                };
            })
        );

        if (original[0] && original[0].autoResolve) resolve(0);
    }

    const resolve = middleware.use(function (index, ...args) {
        const next = args.pop();
        next(list[index].resolve(...args).then(result => {
            emitter.emit('action', result, index, ...args);
            return result;
        }))
    });

    const beforeResolve = middleware.before();

    function findNextIndex(filter = e => true, start = actualIndex) {
        return original.findIndex((item, index, array) => index >= start && filter(item, index, array));
    }

    function findIndex(filter = e => true) {
        return original.findIndex((item, index, array) => filter(item, index, array));
    }

    function on(...args) {
        const dispose = emitter.on(...args);
        disposers.push(dispose);
    }

    function destroy() {
        while (disposers.length) disposers.shift()();
    }

    function getItem(index) {
        return original[index];
    }

    return { schedule, resolve, beforeResolve, findNextIndex, findIndex, on, destroy, getItem };
}

module.exports = { Scheduler };
