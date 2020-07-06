import './console.css';
import { connect } from '../../core/Reactive';
import { Node } from '../../utils/html-utils';

const template = document.createElement('template');
template.innerHTML = `
<div id="inspector-console">
    <div class="device-info"></div>
    <div class="messages"></div>
</div>`;

class Console extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._messages = this.querySelector('.messages');
        this._list = [];
    }

    updateDeviceInfo(params, deviceInfo) {
        const info = this.querySelector('.device-info');
        const { productInfo, device } = params;
        const { os, deviceType, browserName } = deviceInfo;
        info.innerHTML = `<strong>${device.name || ''} ${deviceType} ${os} (${browserName})</strong>
            | <strong>${productInfo.name} -${productInfo.gameId}- ${productInfo.vendor}</strong>`;
    }

    setMessagesStore(messagesStore) {
        connect({ logs: messagesStore }, ({ logs }) => {
            const lastMessage = logs.get().pop();
            logs.update(logs.get());
            const message = Node(`<div class="message">${lastMessage}</div>`);
            this._messages.appendChild(message);
            this._list.push(message);
            if (this._list.length > 3) {
                setTimeout(() => this._messages.removeChild(this._list.shift()), 5000);
            }
        });
    }
}

window.customElements.define('i-console', Console);
