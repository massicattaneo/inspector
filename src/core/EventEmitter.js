function EventEmitter() {
    const events = {};
    const obj = {};

    obj.on = function(eventName, callback) {
        events[eventName] = events[eventName] || [];
        events[eventName].push(callback);
        return () => obj.off(eventName, callback);
    };

    obj.off = function(eventName, callback) {
        const event = events[eventName];
        return event.splice(event.indexOf(callback), 1)[0];
    };

    obj.clear = function() {
        Object.keys(events).forEach(function(eventName) {
            events[eventName].length = 0;
            delete events[eventName];
        });
    };
    obj.emit = function(eventName, ...params) {
        return (events[eventName] || []).map(callback => callback(...params));
    };

    return obj;
}

module.exports = { EventEmitter };
