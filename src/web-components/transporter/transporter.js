import './transporter.css';
import { addCssClass, bullets, draggable, removeCssClass } from '../../utils/html-utils';
import { stringUtils, formatChronograph } from '../../core/core-utils';
import { BTN_STATES, SERVER, VERSION } from '../../core/constants';
import { connect } from '../../core/Reactive';

const { padLeft } = stringUtils;

const TRANSPORTER = {
    SCREEN_SHOOT: 'screen-shoot',
    EXIT: 'exit',
    INFO: 'info',
    RELOAD: 'reload',
    FOLDER: 'folder',
    TIMELINE: 'timeline',
    STORAGE: 'storage',
    EDIT: 'edit',
    MARKER: 'marker',
    SAVE: 'save',
    PLAY: 'play'
};

const template = document.createElement('template');
template.innerHTML = `
    <div class="draggable">${bullets(7, 3)}</div>
    <div class="divider"></div>
    <i-button data-id="${TRANSPORTER.PLAY}" class="fa play"></i-button>
    <i-button data-id="${TRANSPORTER.SAVE}" class="fa stop"></i-button>
    <i-button data-id="${TRANSPORTER.MARKER}" class="fa marker"></i-button>
    <div class="divider"></div>
    <i-button data-id="${TRANSPORTER.SCREEN_SHOOT}" class="fa camera"></i-button>
    <i-button data-id="${TRANSPORTER.EXIT}" class="fa exit"></i-button>    
    <i-button data-id="${TRANSPORTER.RELOAD}" class="fa reload"></i-button>    
    <div class="divider"></div>
    <i-button data-id="${TRANSPORTER.INFO}" class="fa console checked"></i-button>
    <i-button data-id="${TRANSPORTER.FOLDER}" class="fa folder"><span>00</span></i-button>
    <i-button data-id="${TRANSPORTER.EDIT}" class="fa edit"></i-button>
    <i-button data-id="${TRANSPORTER.TIMELINE}" class="fa timeline">00</i-button>
    <div class="time">00:00:000</div>
    <i-button data-id="${TRANSPORTER.STORAGE}" class="fa storage"></i-button>
`;

const readjustTransporterPosition = (node, store, x, y) => {
    const designWidth = store.design.width.get();
    const designHeight = store.design.height.get();
    const designMode = store.design.mode.get();
    const width = Number((window.getComputedStyle(node).width || '').replace('px', ''));
    const height = Number((window.getComputedStyle(node).height || '').replace('px', '')) + 2;
    store.positions[designMode].x.set(Math.max(Math.min(designWidth - width, x), 0));
    store.positions[designMode].y.set(Math.max(Math.min(designHeight - height, y), 0));
    node.style.left = `${store.positions[designMode].x.get()}px`;
    node.style.top = `${store.positions[designMode].y.get()}px`;
};

class Transporter extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    showFeedback(text) {
        // const effect = Node(`<div style="bottom: 50px; right: 50px; width: 100px">${text}</div>`);
        // this.appendChild(effect);
        // setTimeout(() => document.body.removeChild(effect), 800);
    }

    listener(event, dataId, listen) {
        const callback = event => {
            if (event.target.getAttribute('data-id') === dataId || event.target.parentNode.getAttribute('data-id') === dataId) {
                listen(event);
            }
        };
        this.addEventListener(event, callback);
    }

    setStores({ design, positions, transporter, tables, startTimestamp }) {
        const infoEl = this.querySelector(`[data-id="${TRANSPORTER.INFO}"]`);
        const storageEl = this.querySelector(`[data-id="${TRANSPORTER.STORAGE}"]`);
        const folderEl = this.querySelector(`[data-id="${TRANSPORTER.FOLDER}"]`);
        const timelineEl = this.querySelector(`[data-id="${TRANSPORTER.TIMELINE}"]`);
        const draggableNode = this.querySelector('.draggable');
        const timeElement = this.querySelector('.time');

        function step() {
            timeElement.innerHTML = formatChronograph(startTimestamp.get());
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);

        draggable(this, draggableNode, (x, y) => {
            readjustTransporterPosition(this, { design, positions }, x, y);
        });

        draggableNode.addEventListener('dblclick', transporter.collapsed.reverse);

        connect({ recs: tables.recordings.list }, ({ recs }) => {
            folderEl.innerHTML = `${padLeft(recs.get().length, 2)}`;
        });
        connect({ recs: tables.timeline.list }, ({ recs }) => {
            timelineEl.innerHTML = `${padLeft(recs.get().length, 2)}`;
        });

        connect(
            {
                storageBtn: transporter.storageBtn,
                infoBtn: transporter.infoBtn,
                collapsed: transporter.collapsed
            },
            ({ storageBtn, infoBtn, collapsed }) => {
                removeCssClass(infoEl, BTN_STATES.CHECKED, BTN_STATES.UNCHECKED);
                addCssClass(infoEl, infoBtn.is(BTN_STATES.CHECKED) ? BTN_STATES.CHECKED : BTN_STATES.UNCHECKED);
                removeCssClass(storageEl, BTN_STATES.CHECKED, BTN_STATES.UNCHECKED);
                addCssClass(storageEl, storageBtn.is(BTN_STATES.CHECKED) ? BTN_STATES.CHECKED : BTN_STATES.UNCHECKED);
                removeCssClass(this, BTN_STATES.COLLAPSED);
                addCssClass(this, collapsed.is(true) ? BTN_STATES.COLLAPSED : '');
            }
        );

        connect(
            {
                designMode: design.mode,
                designWidth: design.width,
                designHeight: design.height,
                collapsed: transporter.collapsed
            },
            ({ designMode }) => {
                readjustTransporterPosition(
                    this,
                    {
                        design,
                        positions
                    },
                    positions[designMode].x.get(),
                    positions[designMode].y.get()
                );
            }
        );
    }
}

window.customElements.define('i-transporter', Transporter);
