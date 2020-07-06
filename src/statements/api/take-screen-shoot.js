import { COOKIES, SERVER } from '../../core/constants';
import { createInspectorListItem } from '../../core/core-utils';

export default function(data) {
    const body = createInspectorListItem(data);
    if (this.params.standAlone) return Promise.resolve({ href: '' });
    return fetch(`${SERVER.HTTP_ORIGIN}${SERVER.INSPECTOR_API.TAKE_SCREEN_SHOOT}?${COOKIES.GAME_SESSION}=${this.params.sessionToken}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());
}
