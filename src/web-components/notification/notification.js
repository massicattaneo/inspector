import './notification.css';
import { addCssClass, removeCssClass } from '../../utils/html-utils';

const template = document.createElement('template');
template.innerHTML = `<span>TITLE</span>
<strong class="fa alert"></strong>
<strong class="fa info"></strong>
<strong class="fa success"></strong>
<strong class="fa error"></strong>
<i></i>`;

class Notification extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }

    show(icon, text) {
        const element = this;
        this.querySelector('span').innerHTML = text;
        addCssClass(element, icon);
        return Promise.resolve();
    }

    slideIn(icon, text) {
        const element = this;
        return new Promise(resolve => {
            this.querySelector('span').innerHTML = text;
            element.addEventListener('animationend', function listener() {
                removeCssClass(element, 'show');
                element.removeEventListener('animationend', listener);
                resolve();
            });
            addCssClass(element, 'show', icon);
        });
    }

    fadeOut() {
        return new Promise(resolve => {
            const element = this;
            element.addEventListener('animationend', function listener() {
                removeCssClass(element, 'show', 'hide', 'show', 'hide', 'alert', 'info', 'success', 'error');
                element.style.display = 'none';
                element.removeEventListener('animationend', listener);
                resolve();
            });
            addCssClass(element, 'hide');
        });
    }
}

window.customElements.define('i-notification', Notification);
