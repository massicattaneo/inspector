import { Node } from '../../../utils/html-utils';
import { connect } from '../../../core/Reactive';
import { getElementPath } from '../../../core/core-utils';

function createItem({ interaction, match, _id }) {
    return `
            <tr data-id="${_id}">
                <td>${interaction}</td>
                <td>${match}</td>
                <td width="30px">${_id !== "0" ? '<i-button class="fa delete item"></i-button>' : ''}</td>
            </tr>`;
}

function getTableBody(list) {
    return list.map(createItem).join('');
}

export default function () {
    const { system } = this;
    const TABLE = 'settings';
    const iWindow = Node(`<i-window width="500" height="400" data-title="${TABLE.toUpperCase()}"></i-window>`);
    iWindow.autoPositioning(system, `${TABLE}Window`);
    document.body.appendChild(iWindow);

    const { list, filter } = this.store.tables[TABLE];
    const undos = [];

    const menu = iWindow.appendMenu(`
    <form name="menu" autocomplete="off">
        <input type="search" name="search" class="search" placeholder="search"/>
        <span class="fa undo"></span>
        <span class="fa add"></span>
    </form>
    `);

    const content = iWindow.appendContent(`
    <form>
        <table width="100%" class="alternate-table">
            <thead>
            <tr>
                <th><div>interaction</div></th>
                <th><div>match</div></th>
                <th><div>&nbsp;</div></th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </form>
    `);

    const dispose = connect({ list, filter }, ({ list, filter }) => {
        content.querySelector('tbody').innerHTML = getTableBody(list.get()
            .filter(item => item.interaction.match(new RegExp(filter.get(), 'i'))));
    });
    iWindow.addEventListener('close', () => {
        dispose();
    });

    const onAdd = async (body) => await this.thread.main(`window/${TABLE}/create`, body)();
    iWindow.listener('click', 'fa add', () => onAdd());
    iWindow.listener('click', 'fa undo', async event => {
        const undo = undos.shift() || (e => e);
        undo();
    });
    iWindow.listener('click', 'fa delete item', async event => {
        const path = getElementPath(event.target);
        const id = path[2].getAttribute('data-id');
        const item = list.get().find(item => item._id === id);
        this.db.remove(TABLE, id);
        list.splice(list.get().indexOf(item), 1);
        delete item._id;
        undos.push(() => onAdd(item));
    });
    iWindow.listener('keyup', 'search', event => {
        event.preventDefault();
        const path = getElementPath(event.target);
        filter.set(path[0].value);
    });
}
