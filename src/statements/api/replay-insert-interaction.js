import { INTERACTIONS } from '../../core/constants';
import { createInspectorListItem } from '../../core/core-utils';

let itemAddedDuringRecording = 0;
export default function (data) {
    const { params, scheduler, system } = this;

    if (params.isReplaying && scheduler && data.interaction === INTERACTIONS.MARKER) {
        const recording = system.getStorage('recording');
        const nextIndex = scheduler.findNextIndex();
        const actualIndex = nextIndex === -1 ? params.recordingData.length - 1 : nextIndex - 1;
        const recordingDatum = params.recordingData[actualIndex];
        const { resolvedAt, start } = recordingDatum.timestamps || {};
        const gap = Date.now() - resolvedAt;
        const timestamp = start + gap;
        const timestamps = { start: timestamp, end: timestamp, duration: 0 };
        const item = createInspectorListItem(data, { timestamps });
        recording.recordingData.splice(actualIndex + 1 + itemAddedDuringRecording, 0, item);
        system.setStorage({ recording: { ...recording, recordingData: recording.recordingData } });
        itemAddedDuringRecording++;
    }
}
