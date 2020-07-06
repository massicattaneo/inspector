import { COOKIES, SERVER } from '../../core/constants';

export default async function () {
    const { system, params, db } = this;
    const dbUserId = system.getStorage('dbUserId');
    const user = (await db.get('users')).find(item => item._id === dbUserId);
    if (params.standAlone && !user) {
        return window.location = window.location.href.replace(/token=[^&]*/, `token=`).replace(/mode=real/, 'mode=fun');
    }
    if (!params.standAlone) {
        const origin = `${SERVER.HTTP_ORIGIN}${SERVER.INSPECTOR_API.RELOAD}`;
        return fetch(`${origin}?${COOKIES.GAME_SESSION}=${this.params.sessionToken}`);
    }
}
