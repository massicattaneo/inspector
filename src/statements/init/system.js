import { getUrlParameter } from '../../core/core-utils';
const System = e => e;
export default function() {
    const { params } = this;

    if (!getUrlParameter('automation', location.href)) {
        window.history.replaceState(null, null, `${window.location}${window.location.search ? '&' : '?'}automation=true`);
    }

    const config = {
        gameComponent: 'inspector',
        gameAssetsQualities: [0.5],
        gameId: params.productInfo.vendorGameId || 'external'
    };
    const system = System({ config, ua: navigator.userAgent });
    system.initStorage({
        recording: null,
        dbUserId: "0",
        wsSessionToken: ''
    });

    const recording = system.getStorage('recording');
    if (recording) Object.assign(params, recording, { isReplaying: true });

    return { system };
}
