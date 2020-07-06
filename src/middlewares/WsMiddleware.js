import { Middleware } from '../core/Middleware';
import { getBrandById, INTERACTIONS } from '../core/constants';
import { isSavedWebSocketUrl } from '../core/core-utils';

export function WsMiddleware({ params, system, scheduler, store }) {
    const middlewareSend = Middleware();
    const middlewareMessage = Middleware();
    let actualId;
    middlewareSend.timestamps();
    middlewareMessage.timestamps();

    const wsMiddleware = {
        beforeSend: middlewareSend.before(),
        send: middlewareSend.use(function (data, options, callback, superFn, context) {
            return superFn.call(context, data, options, callback);
        }),
        beforeMessage: middlewareMessage.before(),
        message: middlewareMessage.use(function (event, callback, context) {
            callback.call(context, event);
        })
    };

    /**
     * WebSocket Override
     */
    class _WebSocket extends WebSocket {
        constructor(url, ...args) {
            if (url.match(/localhost/)) {
                super(url.replace(/localhost/, `games.${params.environment}.${getBrandById(params.siteId).domain}`), ...args);
            } else {
                super(url, ...args);
            }
            const self = this;
            if (params.isReplaying && isSavedWebSocketUrl(store, url)) {
                const index = scheduler.findNextIndex(item => item.interaction === INTERACTIONS.WS_MESSAGE);
                scheduler.resolve(index)(promise => promise.then(event => {
                    Object.defineProperties(this, {
                        readyState: {
                            writable: true
                        }
                    });
                    this.readyState = 1;
                    const msg = new MessageEvent('message', {
                        data: JSON.stringify({
                            ...event.data,
                            body: JSON.stringify(event.data.body)
                        })
                    });
                    this.onMessageCallback(this, msg);
                }));

                scheduler.beforeResolve(function (...args) {
                    if (!isSavedWebSocketUrl(store, self.url)) return;
                    const next = args.pop();
                    const event = scheduler.getItem(args[0]);
                    if (event.interaction !== INTERACTIONS.WS_MESSAGE) return next(...args);
                    const extraData = {};
                    if (event.data && event.data.body) {
                        Object.assign(extraData, { data: JSON.stringify(event.data.body) });
                    }
                    const msg = new MessageEvent('message', {
                        data: JSON.stringify({
                            ...event.data,
                            ...extraData,
                            id: actualId
                        })
                    });
                    self.onMessageCallback.call(self, msg);
                    next(...args);
                });
                return;
            }
        }

        send(data, opts, callback) {
            if (!isSavedWebSocketUrl(store, this.url)) super.send(data, opts);
            actualId = JSON.parse(data).id;
            if (params.isReplaying) return;
            return wsMiddleware.send(data, opts, callback, super.send, this);
        }

        set onmessage(callback) {
            const self = this;
            if (params.isReplaying) {
                this.onMessageCallback = callback;
                return;
            }
            super.onmessage = function (event) {
                if (!isSavedWebSocketUrl(store, self.url)) return callback.call(this, event);
                wsMiddleware.message(event, callback, self);
            };
        }
    }

    window.WebSocket = _WebSocket;

    return wsMiddleware;
}
