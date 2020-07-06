import './wizard.css';
import { Node } from '../../utils/html-utils';
import { WIZARD } from '../../core/constants';

const template = document.createElement('template');
template.innerHTML = `
<form autocomplete="off">
    <h3>TITLE</h3>
    <h4>STEP</h4>
    <div name="confirm">&nbsp;</div>
    <textarea rows="6" name="textarea" autocomplete="off"></textarea>
    <input type="text" name="text" autocomplete="off" />
    <input type="date" name="date" autocomplete="off" />
    <input type="number" name="number" autocomplete="off" />
    <input type="password" name="password" autocomplete="new-password" />
    <select name="select"></select>
    <div name="multi-check"></div>
    <button class="button fa save" type="submit">CONTINUE</button>
</form>
`;

function toSpaceCase(string) {
    return string.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function toDashCase(string = '') {
    return string
        .replace(/([A-Z])/g, ' $1')
        .replace(/\s/g, '-')
        .toLowerCase();
}

class Wizard extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this.querySelector('h3').innerHTML = 'WIZARD';
    }

    waitFormSubmit({ type, placeholder, list = [] }) {
        return new Promise(resolve => {
            this.querySelectorAll('form *').forEach(item => {
                if (item.type === 'submit') return;
                if (item.tagName === 'H3') return;
                if (item.tagName === 'H4') return;
                item.value = '';
                item.style.display = 'none';
            });
            const element = this.querySelector(`[name=${type}]`);
            element.placeholder = toDashCase(placeholder);
            this.querySelector('h4').innerHTML = `${toSpaceCase(placeholder).toUpperCase()}`;
            switch (type) {
                case WIZARD.TYPES.CONFIRM:
                    break;
                case WIZARD.TYPES.NUMBER:
                case WIZARD.TYPES.TEXT:
                    break;
                case WIZARD.TYPES.SELECT:
                    element.innerHTML = '';
                    list.forEach(({ value, label }) => {
                        element.appendChild(Node(`<option value="${value}">${label}</option>`));
                    });
                    break;
                case WIZARD.TYPES.MULTI_CHECK:
                    element.innerHTML = '';
                    list.forEach(({ value, label }, index) => {
                        const markup = `
<div>
    <input id="multi-check_${index}" name="multi-check-values" value="${value}" type="checkbox"/>
    <label for="multi-check_${index}">${label}</label>
</div>`;
                        element.appendChild(Node(markup));
                    });
                    break;
            }

            element.style.display = 'inline-block';
            setTimeout(() => element.focus(), 50);
            this.addEventListener('submit', event => {
                event.preventDefault();
                if (type === WIZARD.TYPES.MULTI_CHECK) {
                    const values = [];
                    this.querySelector('form')['multi-check-values'].forEach(item => {
                        if (item.checked) values.push(item.value);
                    });
                    resolve(values);
                } else {
                    resolve(element.value);
                }
            });
        });
    }

    async start(array) {
        const results = {};
        for (const index in array) {
            const item = array[index];
            const { placeholder } = item;
            Object.assign(results, { [placeholder]: await this.waitFormSubmit(item) });
        }
        this.parentElement.removeChild(this);
        return results;
    }
}

window.customElements.define('i-wizard', Wizard);
