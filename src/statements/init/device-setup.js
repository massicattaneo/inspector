import { DESIGNS, INTERACTIONS } from '../../core/constants';

export default function () {
    const { thread, system, store } = this;

    system.setDeviceDesignMode(DESIGNS.LANDSCAPE, () => true);
    system.setDeviceDesignMode(DESIGNS.DESKTOP, info => info.deviceType === 'desktop');
    system.setDeviceDesignMode(DESIGNS.PORTRAIT, info => info.width < info.height);

    system
        .onDeviceDesignChange()
        .filter(ev => ev === 'window-resize')
        .subscribe((event, { privateInfo }) => {
            store.design.mode.set(privateInfo.designMode);
            store.design.width.set(privateInfo.width);
            store.design.height.set(privateInfo.height);
        });

    system
        .onDeviceDesignChange()
        .filter(ev => ev === 'window-resize')
        .debounce({ time: 200 })
        .subscribe((ev, { privateInfo } = {}) => {
            const { width, height } = privateInfo;
            thread.main('api/insert-interaction', {
                interaction: INTERACTIONS.WINDOW_RESIZE,
                info: { width, height }
            });
        });

    store.startTimestamp.set(Date.now());
    thread.main('api/insert-interaction', {
        interaction: INTERACTIONS.DEVICE_SETUP_INIT,
        info: system.deviceInfo(),
        userAgent: window.navigator.userAgent
    });
}
