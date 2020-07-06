import { Logger } from '../../middlewares/Logger';
import { Node } from '../../utils/html-utils';

function showTapAnimation(data) {
    const top = data.event.clientY - 25;
    const left = data.event.clientX - 25;
    const effect = Node(`<div style="top: ${top}px; left: ${left}px;" class="effect-tap">TAP</div>`);
    document.body.appendChild(effect);
    setTimeout(() => {
        document.body.removeChild(effect);
    }, 800);
}

export default function () {
    window.inspector = window.inspector || {};
    const params = window.inspector.params || {
        productInfo: {},
        gameId: window.inspector.gameId,
        device: {},
        wsSession: true,
        standAlone: true
    };

    const logger = Logger();

    window.inspector.fire = data => {
        const { eventListenerMiddleware } = this;
        data.event.pointerType = 'mouse';
        showTapAnimation(data);
        eventListenerMiddleware.event(data, { type: data.event.type });
    };

    window.inspector.log = (...args) => {
        logger.log(...args.map(JSON.stringify));
    };

    window.UserInfo = window.UserInfo || {
        showLobby: () => alert('BEATRIX PARENT SHOW LOBBY'),
        showDeposit: () => alert('BEATRIX PARENT SHOW DEPOSIT'),
        showLogin: () => alert('BEATRIX PARENT SHOW LOGIN'),
        showJoin: () => alert('BEATRIX PARENT SHOW JOIN')
    };

    document.cookie = 'SpoofedCountry=US;X-GEOIP-COUNTRY=US';

    return {
        params,
        logger,
        recordingData: [],
        isLoadingFiles: true
    };
}
