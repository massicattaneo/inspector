import { Middleware } from '../core/Middleware';

function dispatchWithDOM(ev, targetEl) {
    delete ev.event.sourceCapabilities;
    const toDispatch = new window[ev.eventConstructor](ev.event.type, ev.event);
    targetEl.dispatchEvent(toDispatch);
}

export function EventListenerMiddleware({ params }) {
    const { isReplaying } = params;
    const _oldAddWindow = Window.prototype.addEventListener;
    const _oldRemoveWindow = Window.prototype.removeEventListener;
    const _oldAddElement = Element.prototype.addEventListener;
    const _oldRemoveElement = Element.prototype.removeEventListener;
    const _oldAddDocument = HTMLDocument.prototype.addEventListener;
    const _oldRemoveDocument = HTMLDocument.prototype.removeEventListener;

    const middleware = Middleware({ autoProceedToAfter: true });
    middleware.timestamps();
    const listeners = [];

    const eventListenerMiddleware = {
        event: middleware.use(function (ev, { type, callback } = {}) {
            if (callback && callback instanceof Function) {
                return callback(ev);
            }
            if (!ev.querySelector) return;
            const targetEl = ev.querySelector.reduce((el, { selector, nth = 0, id }) => {
                if (!el) return null;
                try {
                    if (id) return el.querySelector(`#${id}`);
                } catch (e) {
                }
                return el.querySelectorAll(selector)[nth] || null;
            }, document.body);
            if (!targetEl) return;
            dispatchWithDOM(ev, targetEl);
        }),
        beforeEvent: middleware.before(),
        afterEvent: middleware.after()
    };
    if (isReplaying) {
        return eventListenerMiddleware;
    }

    Window.prototype.addEventListener = function (type, callback, options) {
        function listener(ev) {
            return eventListenerMiddleware.event(ev, { type, callback });
        }

        listeners.push({ type, callback, listener });
        _oldAddWindow.call(this, type, listener, options);
    };

    Window.prototype.removeEventListener = function (type, callback) {
        const item = listeners.find(listener => listener.callback === callback && listener.type === type);
        if (!item) return;
        return _oldRemoveWindow.call(this, type, item.listener);
    };

    Element.prototype.addEventListener = function (type, callback, options) {
        if (type === 'react-invokeguardedcallback') return _oldAddElement.call(this, type, callback, options);

        function listener(ev) {
            return eventListenerMiddleware.event(ev, { type, callback });
        }

        listeners.push({ type, callback, listener });
        _oldAddElement.call(this, type, listener, options);
    };

    Element.prototype.removeEventListener = function (type, callback) {
        if (type === 'react-invokeguardedcallback') return _oldRemoveElement.call(this, type, callback);
        const item = listeners.find(listener => listener.callback === callback && listener.type === type);
        if (!item) return;
        return _oldRemoveElement.call(this, type, item.listener);
    };

    // HTMLDocument.prototype.addEventListener = function (type, callback, options) {
    //     if (type === 'react-invokeguardedcallback') return _oldAddDocument.call(this, type, callback, options);
    //     function listener(ev) {
    //         console.warn('type', type)
    //         return eventListenerMiddleware.event(ev, { type, callback });
    //     }
    //
    //     listeners.push({ type, callback, listener });
    //     return _oldAddDocument.call(this, type, listener, options);
    // };

    // HTMLDocument.prototype.removeEventListener = function (type, callback) {
    //     if (type === 'react-invokeguardedcallback') return _oldRemoveDocument.call(this, type, callback);
    //     const item = listeners.find(listener => listener.callback === callback && listener.type === type);
    //     if (!item) return;
    //     return _oldRemoveDocument.call(this, type, item.listener);
    // };

    document.addEventListener('DOMContentLoaded', () => {
        const type = 'click';
        document.addEventListener(type, ev => {
            setTimeout(() => eventListenerMiddleware.event(ev, { type, callback: () => true }));
        });
    });

    return eventListenerMiddleware;
}
