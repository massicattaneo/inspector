import './icon.css';
import { connect, use } from '../../core/Reactive';

const template = document.createElement('template');
template.innerHTML = '<span>TITLE</span><strong></strong>';

class Icon extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this.querySelector('span').innerHTML = this.getAttribute('title').toLowerCase();
    }

    notification(notify) {
        const strong = this.querySelector('strong');
        use({ notify }, (store, next) => {
            if (store.notify.get() < 0) {
                store.notify.update(0);
            }
            next(store);
        });
        connect({ notify }, () => {
            strong.style.display = notify.is(0) ? 'none' : 'block';
            strong.innerHTML = notify.get();
        });
    }
}

window.customElements.define('i-icon', Icon);
