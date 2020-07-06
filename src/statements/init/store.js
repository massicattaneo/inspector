import * as rx from '../../core/Reactive';
import { BTN_STATES, DESIGNS, INTERACTIONS, MODES } from '../../core/constants';
import { getSafePostMessage, getReplayTimeline } from '../../core/core-utils';

const startTimestamp = Date.now();
export default function() {
    const { system, params, thread } = this;
    const store = rx.create({
        startTimestamp,
        positions: {
            [DESIGNS.DESKTOP]: { x: 0, y: 0 },
            [DESIGNS.PORTRAIT]: { x: 0, y: 0 },
            [DESIGNS.LANDSCAPE]: { x: 0, y: 0 }
        },
        design: {
            mode: system.deviceInfo().designMode,
            width: system.deviceInfo().width,
            height: system.deviceInfo().height
        },
        transporter: {
            storageBtn: BTN_STATES.UNCHECKED,
            infoBtn: BTN_STATES.CHECKED,
            collapsed: false
        },
        explorerWindow: { top: null, left: null, width: null, height: null },
        mode: params.isReplaying ? MODES.PLAY : MODES.RECORD,
        canRecord: true,
        consoleMessages: [],
        tables: {
            recordings: {
                list: []
            },
            timeline: {
                list: params.isReplaying ? getReplayTimeline(params, { beforeAssetLoaded: true }) : []
            },
            games: {
                list: [],
                filter: ''
            },
            users: {
                list: [],
                filter: ''
            },
            settings: {
                list: [],
                filter: ''
            }
        }
    });



    window.addEventListener('message', event => {
        const message = getSafePostMessage(event);
        switch (message.type) {
            case 'window-resize':
                const { top, left, width, height } = message.data;
                store.explorerWindow.top.set(top);
                store.explorerWindow.left.set(left);
                store.explorerWindow.width.set(width);
                store.explorerWindow.height.set(height);
                break;
        }
    });

    return { store };
}
