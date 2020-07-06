import { Node } from '../../utils/html-utils';
import { formatChronograph } from '../../core/core-utils';
import { connect } from '../../core/Reactive';

export default function () {
    const { store, system } = this;
    const iWindow = Node('<i-window width="800" height="215" data-title="TIMELINE"></i-window>');
    document.body.appendChild(iWindow);
    const content = iWindow.appendContent('<div id="visualization"></div>');
    const options = {
        min: store.startTimestamp.get(),
        minHeight: '150px',
        rollingMode: {
            follow: true
        },
        zoomMax: 10000,
        zoomMin: 5000,
        format: {
            majorLabels(date, scale, step) {
                const start = store.startTimestamp.get();
                return formatChronograph(start);
            },
            minorLabels(date, scale, step) {
                const start = store.startTimestamp.get();
                return formatChronograph(start, date.valueOf(), false);
            }
        }
    };
    if (!window.vis) return;
    const timeline = new vis.Timeline(content, [], options);
    const dispose = connect({ list: store.tables.timeline.list }, ({ list }) => {
        timeline.setItems(new vis.DataSet(list.get()));
        timeline.redraw();
    });
    iWindow.autoPositioning(system, 'timelineWindow');
    function destroy() {
        iWindow.removeEventListener('close', destroy);
        timeline.destroy();
        dispose();
    }
    iWindow.addEventListener('close', destroy);
}
