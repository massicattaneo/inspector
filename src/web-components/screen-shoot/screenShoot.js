import { sleep } from '../../core/core-utils';

const SCREENSHOOT = {
    ID: 'inspector-screenshoot',
    VIDEO: '_video'
};

const template = document.createElement('template');

template.innerHTML = `
<div id="${SCREENSHOOT.ID}">
    <video></video>
    <canvas></canvas>
</div>`;

class ScreenShoot extends HTMLElement {
    constructor() {
        super();
        this.appendChild(template.content.cloneNode(true));
        this._video = this.querySelector('video');
        this._canvas = this.querySelector('canvas');
    }

    async takeScreenShoot(store, { heightMargin = 0 } = {}) {
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._canvas.height = this._video.videoHeight;
        this._canvas.width = this._video.videoWidth;
        if (store.explorerWindow.left.get() === null) {
            ctx.drawImage(this._video, 0, 0, this._canvas.width, this._canvas.height);
            return this._canvas.toDataURL();
        }
        const dstW = store.explorerWindow.width;
        const dstH = store.explorerWindow.height - heightMargin;
        this._canvas.width = dstW;
        this._canvas.height = dstH;
        ctx.drawImage(this._video, store.explorerWindow.left.get(), store.explorerWindow.top.get() + 44, dstW, dstH, 0, 0, dstW, dstH);
        return this._canvas.toDataURL();
    }

    async initScreenShot() {
        if (this._video.srcObject) return;
        this._video.srcObject = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: 'never' }, // not working :(
            audio: false
        });
        this._video.play();
        await sleep(500);
    }
}

window.customElements.define('i-screen-shoot', ScreenShoot);
