import { EventEmitter } from '../../core/EventEmitter';
import { KEYBOARD_EVENTS } from '../../core/constants';

export default function() {
    const keyboardManager = EventEmitter();
    window.addEventListener('keyup', function(ev) {
        if (ev.code === 'KeyS' && ev.ctrlKey === true) {
            keyboardManager.emit(KEYBOARD_EVENTS.STOP_RECORDING);
        }
        if (ev.code === 'KeyA' && ev.ctrlKey === true) {
            keyboardManager.emit(KEYBOARD_EVENTS.MARKER);
        }
    });

    return { keyboardManager };
}
