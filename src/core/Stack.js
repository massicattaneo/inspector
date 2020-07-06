function Stack(context = {}) {
    const stack = [];
    let isRunning = false;
    const memo = [];

    const _exe = (...args) => {
        if (stack[0]) {
            isRunning = true;
            return stack.shift().call(context, ...(args || []), (...nextArgs) => {
                isRunning = false;
                memo.length = 0;
                memo.push(...nextArgs);
                _exe(...nextArgs);
                return nextArgs[0];
            });
        }
    };

    function add(fn) {
        if (fn) stack.push(fn);
    }

    function run(fn) {
        add(fn);
        if (!isRunning) return _exe(...memo);
    }

    function clear() {
        while (stack.length) stack.length = 0;
    }

    return { add, run, clear };
}

module.exports = { Stack };
