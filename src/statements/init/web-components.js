import { BTN_STATES, EXPLORER, INSPECTOR, INTERACTIONS, KEYBOARD_EVENTS, MODES, SERVER, SESSION, WIZARD } from '../../core/constants';
import { addCssClass, downLoadJsonFile, hasCssClass, Node, removeCssClass } from '../../utils/html-utils';
import { connect } from '../../core/Reactive';
import { formatChronograph, sleep } from '../../core/core-utils';

const toggleUI = (show, context) => {
    const apps = Object.keys(context.apps).map(name => context.apps[name]);
    const olds = apps.map(app => window.getComputedStyle(app).display || 'block');
    apps.forEach(app => (app.style.display = show ? 'block' : 'none'));
    const allWindows = document.querySelectorAll('i-window');
    allWindows.forEach(win => (win.style.display = 'none'));
    return function restore() {
        apps.forEach((app, index) => (app.style.display = olds[index]));
        allWindows.forEach(win => (win.style.display = 'block'));
    };
};

const parseServerSavedLogMessage = data => {
    return `
<span class="link">RECORDING SAVED - ${data.insertedId}
<a class="link" target="_blank" href="${SERVER.HTTP_ORIGIN}${SERVER.INSPECTOR_API.RECORDING_VIEW}/${data.insertedId}">VIEW</a>
<a class="link" target="_blank" href="${SERVER.HTTP_ORIGIN}${SERVER.INSPECTOR_API.RECORDING_DOWNLOAD}/${data.insertedId}">DOWNLOAD</a>
</span>`;
};

export default function() {
    const { store, thread, params, keyboardManager, system, logger } = this;
    const transporter = Node(`<i-transporter id="${INSPECTOR.TRANSPORTER.ID}"></i-transporter>`);
    transporter.setStores(store);
    const console = Node('<i-console></i-console>');
    console.updateDeviceInfo(params, system.deviceInfo());
    console.setMessagesStore(store.consoleMessages);
    const screenShot = Node('<i-screen-shoot></i-screen-shoot>');

    const takeScreenShootCallback = async () => {
        await screenShot.initScreenShot();
        const restore = toggleUI(false, this);
        await sleep(100);
        const dataUrl = await screenShot.takeScreenShoot(store, { heightMargin: EXPLORER.WINDOW_HEIGHT_MARGIN });
        const image = new Image();
        image.src = dataUrl;
        const win = window.open('');
        win.document.write('<style>body {margin: 0px; background: #292929; text-align: center;}</style>');
        win.document.write(image.outerHTML);
        restore();
        const { href } = await thread.main('api/take-screen-shoot', {
            interaction: INTERACTIONS.SCREEN_SHOOT,
            dataUrl
        })();
        if (href) {
            logger.log(`<a class="link" target="_blank" href="${href}">SCREEN SHOOT TAKEN</a>`);
        } else {
            logger.log('<span class="link">SCREEN SHOOT TAKEN NOT SAVED ON THE REPORTER DB</span>');
        }
    };

    const saveRecording = async () => {
        if (store.mode.is(MODES.PLAY)) return;
        store.canRecord.set(false);
        const data = await thread.main('api/save-interactions')();
        transporter.showFeedback('MESSAGE');
        store.canRecord.set(true);
        store.tables.recordings.list.unshift(data);
        if (!data._id) return logger.log('<span class="link">RECORDING NOT SAVED ON THE REPORTER DB</span>');
        logger.log(parseServerSavedLogMessage(data));
    };

    const exit = () => {
        if (params.sessionOrigin !== SESSION.ORIGIN.DEVELOPMENT) {
            navigator.sendBeacon('/inspector/api/game-close', params.sessionToken);
        }
        window.history.back();
    };

    const reload = () => thread.main('api/reload');

    const insertMarker = async () => {
        await thread.main('api/insert-interaction', {
            interaction: INTERACTIONS.MARKER
        })();
        logger.log('<span class="link">MARKER INSERTED</span>');
        transporter.showFeedback(transporter);
    };

    const logInfoMessage = event => {
        const value = hasCssClass(event.target, BTN_STATES.UNCHECKED) ? BTN_STATES.CHECKED : BTN_STATES.UNCHECKED;
        store.transporter.infoBtn.set(value);
    };

    transporter.listener('click', 'exit', exit);
    transporter.listener('click', 'save', saveRecording);
    transporter.listener('click', 'marker', insertMarker);
    transporter.listener('click', 'reload', reload);
    transporter.listener('click', 'screen-shoot', takeScreenShootCallback);
    transporter.listener('click', 'info', logInfoMessage);
    transporter.listener('click', 'folder', () => thread.main('window/recordings'));
    transporter.listener('click', 'edit', () => thread.main('window/edit'));
    transporter.listener('click', 'timeline', () => thread.main('window/timeline'));
    transporter.listener('click', 'storage', () => thread.main('window/storage'));

    keyboardManager.on(KEYBOARD_EVENTS.SCREEN_SHOOT, takeScreenShootCallback);
    keyboardManager.on(KEYBOARD_EVENTS.STOP_RECORDING, saveRecording);
    keyboardManager.on(KEYBOARD_EVENTS.MARKER, insertMarker);

    function appendTransporter() {
        if (transporter.parentNode === document.body) return;
        document.body.appendChild(transporter);
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (params.isTesting) addCssClass(transporter, 'puppeteer-testing');
        setInterval(appendTransporter, 1000);
        const className = system.deviceInfo().deviceType === 'desktop' ? 'inspector-desktop' : 'inspector-mobile';
        removeCssClass(transporter, 'inspector-desktop', 'inspector-mobile');
        addCssClass(transporter, className);
        addCssClass(transporter, params.isReplaying ? 'replay-mode' : '');

        connect({ infoBtn: store.transporter.infoBtn }, ({ infoBtn }) => {
            const body = document.body;
            if (infoBtn.is(BTN_STATES.CHECKED)) {
                body.appendChild(console);
            } else if (console.parentNode === document.body) {
                body.removeChild(console);
            }
        });
    });

    return { apps: { transporter, console, screenShot } };
}
