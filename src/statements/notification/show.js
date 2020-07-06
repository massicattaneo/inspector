import { Node } from '../../utils/html-utils';
import {wait} from '../../core/wait';

export default function (icon, text, { immediate = false, timeout } = {}) {
    const notification = Node(`<i-notification></i-notification>`);
    const body = document.body;
    body.appendChild(notification);
    const promise = immediate ? notification.show(icon, text) : notification.slideIn(icon, text);
    if (timeout) {
        wait.time(timeout).then(() => notification.fadeOut())
    }
    return {
        fadeOut: async () => {
            await promise;
            await notification.fadeOut();
            document.getElementById('reporter').removeChild(notification);
        },
        hide: async () => {
            await promise;
            document.getElementById('reporter').removeChild(notification);
        }
    };
}
