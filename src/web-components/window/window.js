import './window.css';
import { draggable, Node } from '../../utils/html-utils';
import { EXPLORER } from '../../core/constants';
import { connect } from '../../core/Reactive';
import { getElementPath } from '../../core/core-utils';

const template = document.createElement('template');
template.innerHTML = `
<div class="wrapper">
    <div class="bar">
        <span class="fa close"></span>
        <span class="title"></span>
    </div>
    <div class="menu"></div>
    <div class="content"></div>
</div>
`;

class Window extends HTMLElement {
    constructor() {
        super();
        this.index = 0;
        this.appendChild(template.content.cloneNode(true));
        this.querySelector('.title').innerHTML = this.getAttribute('data-title');
        draggable(this, this.querySelector('.bar'), (x, y) => {
            this.style.left = `${x}px`;
            this.style.top = `${y}px`;
            this.onChanges(window.getComputedStyle(this));
        });
        this.menu = this.querySelector('.menu');
        this.content = this.querySelector('.content');
        this.querySelector('.close').addEventListener('click', () => {
            this.close();
        });
        const myObserver = new ResizeObserver(() => this.resize());
        myObserver.observe(this);
        this.listeners = [];
        this.heightMargin = EXPLORER.WINDOW_HEIGHT_MARGIN;
        this.style.width = `${this.getAttribute('width') || 800}px`;
        this.style.height = `${this.getAttribute('height') || 600}px`;
        this.resize();
    }

    onChanges({ top, left, width, height }) {
    }

    autoPositioning(system, storageProp) {
        system.initStorage({ [storageProp]: {} });
        const storage = system.getStorage(storageProp);

        this.onChanges = ({ top, left, width, height }) => {
            if (!top || !left || !width || !height) return;
            system.setStorage({ [storageProp]: { top, left, width, height } });
        };

        if (storage) {
            this.style.top = storage.top;
            this.style.left = storage.left;
            this.style.width = storage.width;
            this.style.height = storage.height;
        }
    }

    close() {
        this.listeners.forEach(({ event, callback }) => this.removeEventListener(event, callback));
        this.parentElement.removeChild(this);
        this.dispatchEvent(new CustomEvent('close'));
    }

    resize() {
        const { height } = window.getComputedStyle(this);
        const calc = Number(height.replace('px', '')) - this.heightMargin;
        this.content.style.height = `${calc}px`;
        this.onChanges(window.getComputedStyle(this));
        this.shouldLoadContent() && this.load && this.load();
    }

    appendContent(node, { scrollable = true, items } = {}) {
        const append = node instanceof Object ? node : Node(node);
        const content = this.content;
        const self = this;
        content.appendChild(append);
        const body = content.querySelector('tbody');
        if (items) {
            this.load = async function () {
                const item = items.get()[self.index++];
                if (!item) return Promise.resolve();
                body.appendChild(item);
                await new Promise(r => setTimeout(r, 0));
                if (self.shouldLoadContent()) await self.load();
            };
            content.addEventListener('scroll', () => {
                if (this.shouldLoadContent()) {
                    this.load();
                }
            });
            const dispose = connect({ items }, async () => {
                this.index = 0;
                body.innerHTML = '';
                await this.load();
            });
        }
        if (!scrollable) {
            content.style.overflow = 'hidden';
        }

        return append;
    }

    shouldLoadContent() {
        const { height } = window.getComputedStyle(this);
        const windowHeight = Number(height.replace('px', ''));
        const remaining = this.content.scrollHeight - this.content.scrollTop - windowHeight;
        const customGap = 350;
        return remaining + customGap < windowHeight;
    }

    listener(event, className, listen) {
        const callback = event => {
            const path = getElementPath(event.target);
            if (path[0].className === className) {
                listen(event);
            }
        };
        this.listeners.push({ event, callback });
        this.addEventListener(event, callback);
    }

    appendMenu(node) {
        const append = node instanceof Object ? node : Node(node);
        this.menu.appendChild(append);
        return append;
    }

    hideCloseButton() {
        this.querySelector('.close').style.display = 'none';
    }
}

window.customElements.define('i-window', Window);
