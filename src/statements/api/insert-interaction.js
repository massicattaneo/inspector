import { INTERACTIONS } from '../../core/constants';
import { createInspectorListItem } from '../../core/core-utils';

const windowMousePosition = { x: 0, y: 0 };
window.addEventListener('mousemove', ev => {
    windowMousePosition.x = ev.pageX;
    windowMousePosition.y = ev.pageY;
});

let previous = Date.now()
export default function (data) {
    const { params, store, recordingData, thread } = this;

    thread.main('api/replay-insert-interaction', data);

    if (params.isReplaying) return;
    if (store && store.canRecord.is(false)) return;

    if (data.interaction === INTERACTIONS.HTTP_REQUEST && data.response && data.response.body.startsWith('NO_RESPONSE')) {
        return Promise.resolve();
    }

    const item = createInspectorListItem(data, { mousePosition: windowMousePosition });
    recordingData.push(item);
    if (data.interaction === INTERACTIONS.POINTER && ((Date.now() - previous) < 10)) {
        previous = Date.now();
        return;
    }
    previous = Date.now();
    // if (data.interaction === INTERACTIONS.POINTER && (data.event.type.indexOf('up') !== -1 || data.event.type.indexOf('click') !== -1)) return;
    store.tables.timeline.list.push({
        id: store.tables.timeline.list.get().length,
        content: data.interaction,
        start: Date.now()
    });
}
