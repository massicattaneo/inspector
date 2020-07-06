/* eslint-disable import/extensions,import/extensions,import/no-unresolved,no-restricted-globals,no-alert,require-jsdoc */
import { Middleware } from '../core/Middleware';
import { SERVER, INTERACTIONS } from '../core/constants';
import { isPushPoll, isSavedHttpUrl } from '../core/core-utils';

let lastHttpReplayIndex = 0;

function overrideWriteProperties(request, global) {
    global.Object.defineProperties(request, {
        responseText: {
            writable: true
        },
        status: {
            writable: true
        },
        readyState: {
            writable: true
        },
        getResponseHeader: {
            writable: true
        }
    });
}

function sendPushPoll(request, data) {
    const [clientGuid, sessionId] = data.split(':');
    request.getResponseHeader = function (name) {
        if (name.toLowerCase() === 'ct-errorcode') return 'NO_RESPONSE';
        if (name.toLowerCase() === 'ct-client-guid') return clientGuid;
        if (name.toLowerCase() === 'ct-session-id') return sessionId;
    };

    return setTimeout(() => {
        const text = `NO_RESPONSE:${clientGuid}:${sessionId}:False\nNO_RESPONSE\nNo push message available`;
        request.responseText = text;
        (request.onReadyCallback || request.onLoadCallback).call(request, {});
    }, 10000);
}

async function resolveScheduledEvent(request, scheduler, data) {
    const index = scheduler.findNextIndex(({ interaction }) => interaction === INTERACTIONS.HTTP_REQUEST, lastHttpReplayIndex);
    lastHttpReplayIndex = index + 1;
    if (index === -1) return;
    scheduler.resolve(index)(promise => promise.then(item => {
        request.getResponseHeader = function (name) {
            const match = item.response.headers.match(new RegExp(`${name.toLowerCase()}: (.*)`)) || ['', ''];
            return match[1];
        };
        request.getAllResponseHeaders = () => item.response.headers;
        request.responseText = JSON.stringify(item.response.body);
        request.status = 200;
        request.readyState = 4;
        (request.onReadyCallback || request.onLoadCallback).call(request, {});
    }));
}

export function HttpRequestMiddleware({ params, system, scheduler, store }, global) {
    const middleware = Middleware();
    const { isReplaying } = params;

    middleware.timestamps();
    const httpMiddleware = {
        beforeSend: middleware.before(),
        afterSend: middleware.after(),
        send: middleware.use(function (request, data, next) {
            request.sendNext = () => {
                next(request, data);
            };
            request._sendCallback(data);
        })
    };

    /**
     * HttpRequest Override
     */

    try {
        class _XMLHttpRequest extends global.XMLHttpRequest {
            constructor() {
                return super();
            }

            set onreadystatechange(callback) {
                this.onReadyCallback = callback;
                super.onreadystatechange = event => {
                    callback.call(this, event);
                    if (this.status === 200 && this.readyState === 4 && this.sendNext) {
                        this.sendNext();
                    }
                };
            }

            set onload(callback) {
                this.onLoadCallback = callback;
                super.onload = event => {
                    callback.call(this, event);
                    if (this.status === 200 && this.readyState === 4 && this.sendNext) {
                        this.sendNext();
                    }
                };
            }

            open(method, url, options) {
                this.url = url;
                return super.open(method, this.url, options);
            }

            send(data) {
                if (isReplaying && isSavedHttpUrl(store, this.url)) {
                    overrideWriteProperties(this, global);
                    if (isPushPoll(this.url)) return sendPushPoll(this, data);
                    return resolveScheduledEvent(this, scheduler, data);
                }
                this._sendCallback = super.send;
                httpMiddleware.send(this, data);
            }
        }

        global.XMLHttpRequest = _XMLHttpRequest;
    } catch (e) {
    }


    return httpMiddleware;
}
