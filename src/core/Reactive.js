const { EventEmitter } = require('./EventEmitter');
const { Middleware } = require('./Middleware');

function Reactive(entryValue) {
    const emitter = EventEmitter();
    const middleware = Middleware({ autoProceedToAfter: true });
    emitter.beforeEmit = middleware.before();
    emitter.emit = middleware.use(emitter.emit);

    let value = entryValue;

    function set(newValue) {
        const _old = value;
        value = newValue;
        return _old === newValue ? '' : emitter.emit('set', value);
    }

    function update(newValue) {
        value = newValue;
    }

    function get() {
        emitter.emit('get', value);
        return value;
    }

    function emitChange() {
        emitter.emit('set', value);
        return value;
    }

    function valueOf() {
        return get();
    }

    function toString() {
        return get().toString();
    }

    function is(compareValue) {
        return compareValue === value;
    }

    function reverse() {
        return set(!value);
    }

    function push(...args) {
        const res = value.push(...args);
        emitter.emit('set', value);
        return res;
    }

    function unshift(...args) {
        const res = value.unshift(...args);
        emitter.emit('set', value);
        return res;
    }

    function splice(...args) {
        const res = value.splice(...args);
        emitter.emit('set', value);
        return res;
    }

    if (Array.isArray(entryValue)) return { push, splice, get, emitter, unshift, emitChange, update };
    return {
        set,
        get,
        emitter,
        valueOf,
        toString,
        update,
        is,
        reverse,
        emitChange

    };
}

function create(target) {
    if (Array.isArray(target)) return Reactive(target);
    if (target instanceof Object) return Object.keys(target).reduce((o, i) => Object.assign(o, { [i]: create(target[i]) }), {});
    return Reactive(target);
}

function connect(store, callback) {
    const first = [];
    const removers = Object.keys(store).map(key => {
        store[key].emitter.beforeEmit(function(key, value, next) {
            if (key === 'first' && first.push(key) === Object.keys(store).length) {
                callback(store);
            }
            next(key, value);
        });
        return store[key].emitter.on('set', () => callback(store));
    });
    Object.values(store).forEach(s => s.emitter.emit('first', ''));
    return () => removers.forEach(r => r());
}

function use(store, callback) {
    Object.keys(store).forEach(key =>
        store[key].emitter.beforeEmit((key, value, next) => {
            if (key === 'get') return;
            callback(store, () => next(key, value));
        })
    );
}

module.exports = { create, connect, use };
