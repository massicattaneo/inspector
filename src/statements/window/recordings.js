import { Node } from '../../utils/html-utils';
import { INTERACTIONS, WIZARD } from '../../core/constants';
import { connect } from '../../core/Reactive';
import { formatChronograph, getElementPath } from '../../core/core-utils';
import { downLoadJsonFile } from '../../utils/html-utils';

function createItem({ uploadName = '', created, recordingData = [] }, index, { store }) {
    const pointers = recordingData.filter(item => item.interaction === INTERACTIONS.POINTER).length;
    return `
            <tr draggable="true" class="draggable" data-id="${index}">
                <td>${uploadName || formatChronograph(store.startTimestamp.get(), created, false)}</td>
                <td>${Math.ceil(pointers / 3)}</td>
                <td>${recordingData.filter(item => item.interaction === INTERACTIONS.HTTP_REQUEST).length}</td>
                <td>${recordingData.filter(item => item.interaction === INTERACTIONS.WS_MESSAGE).length}</td>
                <td>${recordingData.filter(item => item.interaction === INTERACTIONS.MARKER).length}</td>
                <td>${recordingData.length}</td>
                <td width="30px"><i-button class="fa download"></i-button></td>
                <td width="30px"><i-button class="fa play"></i-button></td>
                <td width="30px"><i-button class="fa delete"></i-button></td>
            </tr>`;
}

function getTableBody(list, context) {
    return list.map((item, index) => createItem(item, index, context)).join('');
}

export default async function() {
    const TABLE = 'recordings';
    const { list, filter } = this.store.tables[TABLE];


    const { system, thread } = this;
    const iWindow = Node('<i-window width="500" height="300" data-title="RECORDINGS"></i-window>');
    iWindow.autoPositioning(system, 'recordingWindow');
    document.body.appendChild(iWindow);

    const menu = iWindow.appendMenu(`<form name="menu" autocomplete="off">
    <label>Upload</label> <input type="file" class="file-upload"/>
</form>`);

    const uploadEl = menu.querySelector('.file-upload');
    uploadEl.addEventListener('change', () => {
        const file = uploadEl.files[0];
        const { name, type } = file;
        if (type !== 'application/json') return (uploadEl.value = '');
        const reader = new FileReader();
        reader.onload = function(e) {
            list.push({ ...JSON.parse(e.target.result), uploadName: `UPLOAD: ${name}` });
            uploadEl.value = '';
        };
        reader.readAsText(file);
    });

    const content = iWindow.appendContent(`
    <table width="100%" class="alternate-table">
            <thead>
            <tr>
                <th><div>duration</div></th>
                <th style="width: 50px"><div>pointer</div></th>
                <th style="width: 50px"><div>http</div></th>
                <th style="width: 50px"><div>ws</div></th>
                <th style="width: 50px"><div>markers</div></th>
                <th style="width: 50px"><div>total</div></th>
                <th style="width: 30px"><div>&nbsp;</div></th>
                <th style="width: 30px"><div>&nbsp;</div></th>
                <th style="width: 30px"><div>&nbsp;</div></th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `);

    const dispose = connect({ list }, ({ list }) => {
        content.querySelector('tbody').innerHTML = getTableBody(list.get(), this);
    });

    iWindow.listener('click', 'fa delete', async event => {
        const path = getElementPath(event.target);
        const id = path[2].getAttribute('data-id');
        const item = list.get().find((item, index) => index === Number(id));
        list.splice(list.get().indexOf(item), 1);
    });

    iWindow.listener('click', 'fa play', async event => {
        const path = getElementPath(event.target);
        const id = path[2].getAttribute('recording-id');
        const data = list.get().find((item, index) => index === Number(id));
        const recording = Object.assign({}, data);
        delete recording.standAlone;
        delete recording.wsSession;
        this.system.setStorage({ recording });
        this.thread.main('api/reload');
    });

    iWindow.listener('click', 'fa download', async event => {
        const { title } = await this.thread.main(
            'dialog/wizard',
            {
                list: [{ type: WIZARD.TYPES.TEXT, placeholder: 'title' }]
            },
            'body'
        )();
        const path = getElementPath(event.target);
        const id = path[2].getAttribute('data-id');
        const recording = list.get().find((item, index) => index === Number(id));
        downLoadJsonFile(this.params, title, recording);
    });

    function destroy() {
        iWindow.removeEventListener('close', destroy);
        dispose();
    }
    iWindow.addEventListener('close', destroy);
}

