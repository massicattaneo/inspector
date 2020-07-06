import { HttpRequestMiddleware } from '../../middlewares/HttpRequestMiddleware';
import { LocalStorageMiddleware } from '../../middlewares/LocalStorageMiddleware';
import { EventListenerMiddleware } from '../../middlewares/EventListenerMiddleware';
import { WsMiddleware } from '../../middlewares/WsMiddleware';
import { ImageMiddleware } from '../../middlewares/ImageMiddleware';
import { getQuerySelector } from '../../utils/html-utils';
import { INTERACTIONS, INSPECTOR, INSPECTOR_LOCAL_STORAGE_PREFIX } from '../../core/constants';
import {
    getElementPath,
    getReplayTimeline,
    isPushPoll,
    isSavedHttpUrl,
    isSavedWebSocketUrl
} from '../../core/core-utils';
import { IFrameMiddleware } from '../../middlewares/IFrameMiddleware';

const CHECK_ASSETS_LOAD_INTERVAL = 3000;

function setReplayAssetsLoaded({ scheduler, store, params }, end) {
    if (!params.isReplaying) return;
    const index = scheduler.findIndex(({ interaction }) => interaction === INTERACTIONS.ASSETS_LOADED);
    if (index === -1) return;
    scheduler.resolve(index);
    store.tables.timeline.list.splice(0, 10000);
    const replayTimeline = getReplayTimeline(params, { start: store.startTimestamp.get() });
    const assetLoad = replayTimeline[index];
    store.tables.timeline.list.push(
        ...replayTimeline.map((item, i) => {
            if (i <= index) return item;
            return {
                ...item,
                start: item.start + (end - assetLoad.start)
            };
        })
    );
}

const lastInserted = {};

function insertInteraction(context, event, thread) {
    const parsedEvent = {};
    for (const prop in event) {
        try {
            JSON.stringify(event[prop]);
            parsedEvent[prop] = event[prop];
        } catch (ev) {
        }
    }

    const now = Date.now();
    if (lastInserted.type === parsedEvent.type && lastInserted.timestamp >= (now + 5)) return;
    Object.assign(lastInserted, { type: parsedEvent.type, timestamp: now });
    return {
        interaction: INTERACTIONS.POINTER,
        timestamps: context.timestamps,
        eventConstructor: event.constructor.name,
        querySelector: context.querySelector,
        event: parsedEvent
    };
}

export default function () {
    const { logger, thread, params, store } = this;
    const iframeMiddleware = IFrameMiddleware(this);
    const httpMiddleware = HttpRequestMiddleware(this, window);
    const localStorageMiddleware = LocalStorageMiddleware(this);
    const eventListenerMiddleware = EventListenerMiddleware(this);
    const eventWsMiddleware = WsMiddleware(this);
    const imageMiddleware = ImageMiddleware(this);

    let int;
    let sendAssetsLoadedDone = false;

    const sendAssetsLoaded = () => {
        if (sendAssetsLoadedDone) return;
        sendAssetsLoadedDone = true;
        const end = Date.now();
        document.body.removeChild(this.blockInteractions);
        thread.main('api/insert-interaction', {
            interaction: INTERACTIONS.ASSETS_LOADED,
            timestamps: {
                start: end,
                end,
                duration: 0
            }
        });
        setReplayAssetsLoaded(this, end);
    };

    function afterHttpRequest(request, data, next) {
        if (isSavedHttpUrl(store, request.url)) {
            thread.main('api/insert-interaction', {
                interaction: INTERACTIONS.HTTP_REQUEST,
                response: {
                    headers: request.getAllResponseHeaders(),
                    body: request.responseText
                },
                request: data,
                url: request.url,
                timestamps: this.timestamps
            });
        }
        if (!isPushPoll(request.url)) {
            clearInterval(int);
            int = setTimeout(sendAssetsLoaded, CHECK_ASSETS_LOAD_INTERVAL);
        }
        next(request, data);
    }

    iframeMiddleware.beforeSend(function (request, data, next) {
        logger.log('HTTP-REQUEST', request.url);
        next(request, data);
    })

    httpMiddleware.beforeSend(function (request, data, next) {
        if (!params.isReplaying &&  request.url.match(/monitoring-apm/)) {
            thread.main('api/insert-interaction', {
                interaction: INTERACTIONS.APM_EVENT,
                url: request.url,
                data
            });
        }
        logger.log('HTTP-REQUEST', request.url);
        next(request, data);
    });

    iframeMiddleware.afterSend(afterHttpRequest);
    httpMiddleware.afterSend(afterHttpRequest);

    eventWsMiddleware.beforeMessage(function (event, callback, context, next) {
        if (params.isReplaying) return next(event, callback, context);
        if (isSavedWebSocketUrl(store, event.currentTarget.url)) {
            logger.log('WS-MESSAGE', event.currentTarget.url);
            thread.main('api/insert-interaction', {
                interaction: INTERACTIONS.WS_MESSAGE,
                data: event.data,
                webSocketInfo: {
                    url: event.currentTarget.url
                }
            });
        }
        next(event, callback, context);
    });
    eventWsMiddleware.beforeSend(function (data, options, callback, superFn, context, next) {
        logger.log('WS-SEND', data);
        next(data, options, callback, superFn, context);
    });

    localStorageMiddleware.beforeSetItem(function (key, value, context, next) {
        if (!key.startsWith(INSPECTOR_LOCAL_STORAGE_PREFIX)) {
            logger.log('SET-STORAGE', key, value);
        }
        next(key, value, context);
    });

    eventListenerMiddleware.beforeEvent(function (event, callback, next) {
        if (!event.target) return next(event, callback);
        this.querySelector = getQuerySelector(event.target);
        next(event, callback);
    });

    imageMiddleware.beforeLoad(function (callback, image, next) {
        next(callback, image);
    });

    imageMiddleware.afterLoad(function (image) {
        clearInterval(int);
        int = setTimeout(sendAssetsLoaded, CHECK_ASSETS_LOAD_INTERVAL);
        const loc = `${new URL(image.src).origin}${new URL(image.src).pathname}`;
        logger.log('IMAGE LOADED', loc);
        if (!params.isReplaying && image.src.match(/%3Acasino%3A/)) {
            thread.main('api/insert-interaction', {
                interaction: INTERACTIONS.WEBTREKK_EVENT,
                src: image.src,
                timestamps: this.timestamps
            });
        }
    });

    let lastQuerySelector = null;
    eventListenerMiddleware.afterEvent(function (event, callback, next) {
        if (!event.target) return;
        const path = getElementPath(event.target);
        if (path.filter(el => el.id === INSPECTOR.TRANSPORTER.ID).length) {
            next(event, callback);
            return;
        }
        if (path.filter(el => el.tagName === 'I-WINDOW').length) {
            next(event, callback);
            return;
        }
        switch (event.type) {
        case 'pointerdown':
        case 'mousedown':
            lastQuerySelector = this.querySelector;
            break;
        case 'pointerup':
        case 'mouseup':
            if (lastQuerySelector) this.querySelector = lastQuerySelector;
            lastQuerySelector = null;
            break;
        }
        switch (event.type) {
        case 'click':
        case 'mousedown':
        case 'mouseup':
        case 'pointerdown':
        case 'pointerup':
            const inserted = insertInteraction(this, event, thread);
            if (!inserted) return;
            thread.main('api/insert-interaction', inserted);
            logger.log('POINTER', inserted.event.type);
            break;
        }

        next(event, callback);
    });

    logger.beforeLog((...args) => {
        const log = args
            .splice(0, args.length - 1)
            .filter(i => i)
            .join(' - ');
        const [_next] = args;
        store.consoleMessages.push(log);
        _next();
    });

    return { httpMiddleware, eventListenerMiddleware, WsMiddleware };
}
