import { BTN_STATES, DESIGNS, INTERACTIONS, INSPECTOR_LOCAL_STORAGE_PREFIX, EXPLORER_LOCAL_STORAGE_PREFIX } from '../../core/constants';
import * as rx from '../../core/Reactive';

const POSITIONS = `${INSPECTOR_LOCAL_STORAGE_PREFIX}positions`;

const convertToValue = string => {
    if (string === 'true') return true;
    if (string === 'false') return false;
    if (string === '') return '';
    if (!isNaN(string)) return Number(string);
};

function connectStoreToLocalStorage(storeProp, localStorageProp, defaultValue) {
    const itemValue = localStorage.getItem(`${INSPECTOR_LOCAL_STORAGE_PREFIX}${localStorageProp}`);
    storeProp.set(itemValue === undefined ? defaultValue : convertToValue(itemValue));
    rx.connect({ value: storeProp }, function({ value }) {
        localStorage.originalSetItem(`${INSPECTOR_LOCAL_STORAGE_PREFIX}${localStorageProp}`, value.get());
    });
}

export default function() {
    const { store, params, thread } = this;

    const storePositionsX = Object.values(DESIGNS).reduce(
        (acc, value) => Object.assign(acc, { [`${value}_x`]: store.positions[value].x }),
        {}
    );
    const storePositionsXY = Object.values(DESIGNS).reduce(
        (acc, value) => Object.assign(acc, { [`${value}_y`]: store.positions[value].y }),
        storePositionsX
    );
    rx.use(storePositionsXY, function(values, next) {
        const storage = Object.keys(values).reduce((acc, key) => Object.assign(acc, { [key]: values[key].get() }), {});
        localStorage.originalSetItem(POSITIONS, JSON.stringify(storage));
        next();
    });
    const initialPositions = JSON.parse(localStorage.getItem(POSITIONS)) || {};
    Object.keys(storePositionsXY).forEach(function(key) {
        const [design, coord] = key.split('_');
        const defaultValue = coord === 'x' ? 0 : 50;
        store.positions[design][coord].update(initialPositions[key] || defaultValue);
    });

    if (!params.isReplaying) {
        const keys = Object.keys(window.localStorage)
            .filter(key => !key.startsWith(EXPLORER_LOCAL_STORAGE_PREFIX))
            .filter(key => !key.startsWith(INSPECTOR_LOCAL_STORAGE_PREFIX));
        thread.main('api/insert-interaction', {
            interaction: INTERACTIONS.LOCAL_STORAGE_INIT,
            items: keys.reduce((acc, key) => acc.concat([[key, localStorage.getItem(key)]]), [])
        });
    }
    connectStoreToLocalStorage(store.transporter.infoBtn, 'infoBtn', BTN_STATES.CHECKED);
    connectStoreToLocalStorage(store.transporter.collapsed, 'collapsed', false);

    return {};
}
