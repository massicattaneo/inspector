import './dialog.css';
import { getElementPath } from '../../core/core-utils';

const template = document.createElement('template');
template.innerHTML = `
<div>
    <div class="content"></div>
</div>
`;

class Dialog extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    show(content) {
        this.querySelector('.content').appendChild(content);
        const el = this.querySelector('.content');
        el.style.marginTop = '50px';
        this.addEventListener('click', this.bgClick);
    }

    bgClick(event) {
        const path = getElementPath(event.target);
        if (path[0] === this) this.close();
    }

    close() {
        this.removeEventListener('click', this.bgClick);
        this.parentNode.removeChild(this);
    }
}

window.customElements.define('i-dialog', Dialog);
