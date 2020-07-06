import {
    INTERACTIONS,
    INSPECTOR_LOCAL_STORAGE_PREFIX,
    COOKIES,
    EXPLORER_LOCAL_STORAGE_PREFIX,
    EXPLORER,
    SERVER
} from '../../core/constants';
import { Scheduler } from '../../core/Scheduler';

function fireResize(message) {
    if (opener) {
        window.resizeTo(message.data.info.width, message.data.info.height + EXPLORER.WINDOW_HEIGHT_MARGIN - 30);
    } else {
        window.parent.postMessage(JSON.stringify(message), '*');
    }
}

const isClientMessage = item =>
    item.interaction === INTERACTIONS.WS_MESSAGE ||
    item.interaction === INTERACTIONS.WEBTREKK_EVENT ||
    item.interaction === INTERACTIONS.APM_EVENT ||
    item.interaction === INTERACTIONS.POINTER ||
    item.interaction === INTERACTIONS.MARKER ||
    item.interaction === INTERACTIONS.WINDOW_RESIZE ||
    item.interaction === INTERACTIONS.DEVICE_SETUP_INIT ||
    item.interaction === INTERACTIONS.LOCAL_STORAGE_INIT;

export default function () {
    const self = this;
    const { params, logger, system } = this;
    const { sessionToken } = params;
    const wsSessionToken = system.getStorage('wsSessionToken');
    system.removeStorage('wsSessionToken');
    const token = sessionToken || wsSessionToken;
    const url = token
        ? `${SERVER.WSS_ORIGIN}?${COOKIES.GAME_SESSION}=${token}`
        : `${SERVER.WSS_ORIGIN}?href=${encodeURIComponent(location.href)}&sessionUser=${system.getCookie('inspector.user')}`;
    const scheduler = Scheduler();

    function connect() {
        const ws = new WebSocket(url);

        ws.onopen = function () {
            Object.assign(self.params, { standAlone: false });
            setInterval(function () {
                ws.send(JSON.stringify({ type: 'heartbeat' }));
            }, 3000);
            ws.send(JSON.stringify({ type: 'open' }));
        };
        ws.onmessage = function (message) {
            const parsed = JSON.parse(message.data);
            switch (parsed.type) {
            case INTERACTIONS.RELOAD:
                if (parsed.data.wsSession) {
                    system.setStorage({ wsSessionToken: parsed.data.sessionToken });
                }
                window.location.search = `?${parsed.data.queryString}`;
                break;
            case INTERACTIONS.LOGGER:
                logger[parsed.data.type](...parsed.data.arguments);
                break;
            case INTERACTIONS.SEND_CONTEXT:
                Object.assign(self.params, parsed.data);
                self.apps.console.updateDeviceInfo(params, system.deviceInfo());
                break;
            }
        };

        ws.onclose = function (error) {
        };

        ws.onerror = function (error) {
            console.log('Socket encountered error: ', error.message, 'Closing socket');
            ws.close();
        };

        return ws;
    }

    connect();

    if (this.params.isReplaying) {
        const array = this.params.recordingData.map(event => {
            return {
                ...event,
                scheduledAction: () => {
                    if (isClientMessage(event)) {
                        switch (event.interaction) {
                        case INTERACTIONS.POINTER:
                            window.inspector.fire(event);
                            break;
                        case INTERACTIONS.WINDOW_RESIZE:
                            const message = { ...event, sessionToken };
                            fireResize({ data: message });
                            break;
                        case INTERACTIONS.LOCAL_STORAGE_INIT:
                            Object.keys(window.localStorage)
                                .filter(key => !key.startsWith(INSPECTOR_LOCAL_STORAGE_PREFIX))
                                .filter(key => !key.startsWith(EXPLORER_LOCAL_STORAGE_PREFIX))
                                .forEach(key => localStorage.removeItem(key));
                            event.items.forEach(values => localStorage.originalSetItem(...values));
                            break;
                        case INTERACTIONS.DEVICE_SETUP_INIT:
                            const { info } = event;
                            fireResize({
                                sessionToken,
                                type: INTERACTIONS.WINDOW_RESIZE,
                                data: { info }
                            });
                            break;
                        case INTERACTIONS.MARKER:
                            if (params.isTesting) navigator.sendBeacon('/inspector-marker', '');
                            break;
                        }
                    }
                },
                autoResolve: isClientMessage(event)
            };
        });
        scheduler.schedule(array);
    }

    return {
        scheduler
    };
}
