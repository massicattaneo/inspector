import { Node } from '../../utils/html-utils';
import { BTN_STATES } from '../../core/constants';

let openWindow;
export default function () {
    const { system, thread, store } = this;
    if (openWindow) {
        store.transporter.storageBtn.set(BTN_STATES.UNCHECKED);
        openWindow.close();
        openWindow = undefined;
        return;
    }
    store.transporter.storageBtn.set(BTN_STATES.CHECKED);
    const iWindow = openWindow = Node('<i-window width="180" height="90" style="resize: none;" data-title="STORAGE"></i-window>');
    iWindow.autoPositioning(system, 'storageWindow');
    iWindow.hideCloseButton();
    document.body.appendChild(iWindow);

    const element = iWindow.appendContent(`
<div class="storage">
    <i-icon class="fa users" title="USERS"></i-icon>
    <i-icon class="fa games" title="GAMES"></i-icon>
    <i-icon class="fa settings" title="SETTINGS"></i-icon>
</div>
    `);
    element.parentNode.style.margin = '0';
    element.parentNode.style.overflow = 'hidden';

    element.querySelector('.settings').addEventListener('click', function () {
        thread.main('window/settings/list');
    });
    element.querySelector('.games').addEventListener('click', function () {
        thread.main('window/games');
    });
    element.querySelector('.users').addEventListener('click', function () {
        thread.main('window/users/list');
    });

    function destroy() {
        iWindow.removeEventListener('close', destroy);
    }

    iWindow.addEventListener('close', destroy);
}
