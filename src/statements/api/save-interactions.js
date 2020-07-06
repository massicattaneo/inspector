import { COOKIES, SERVER } from '../../core/constants';

function checkKeys(obj) {
    Object.keys(obj).forEach(key => {
        if (key.indexOf('.') !== -1) {
            console.warn('DELETING KEY', key, obj[key]);
            delete obj[key];
        }
        if (obj[key] instanceof Object) checkKeys(obj[key]);
    });
}

export default function(data) {
    const { recordingData, params, system } = this;
    if (!data.timestamps) {
        Object.assign(data, { timestamps: { start: Date.now(), end: Date.now(), duration: 0 } });
    }
    const recording = {
        ...params,
        recordingData,
        created: Date.now(),
        sessionUser: system.getCookie('inspector.user')
    };
    checkKeys(recording);
    delete recording.development;
    const body = JSON.stringify(recording);
    if (params.standAlone) return Promise.resolve(recording);
    return fetch(`${SERVER.HTTP_ORIGIN}${SERVER.INSPECTOR_API.SAVE_INTERACTIONS}?${COOKIES.GAME_SESSION}=${params.sessionToken}`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then(({ data }) => data.ops[0]);
}
