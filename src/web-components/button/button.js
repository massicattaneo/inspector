import './button.css';

const template = document.createElement('template');

class Button extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
    }
}

window.customElements.define('i-button', Button);
