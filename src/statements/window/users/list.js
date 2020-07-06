import { getBrandById } from '../../../core/constants';
import { connect } from '../../../core/Reactive';
import { Node } from '../../../utils/html-utils';
import { getElementPath } from '../../../core/core-utils';

function createItem({ username, siteId, environment, _id }, dbUserId) {
    return `
            <tr data-id="${_id}">
                <td>${username}</td><td>${environment}</td>
                <td>${getBrandById(siteId).domain}</td>
                <td><input type="radio" name="selection" value="${_id}" ${_id.toString() === dbUserId ? 'checked': ''}/></td>
                <td width="30px">${_id !== "0" ? '<i-button class="fa delete item"></i-button>' : ''}</td>
            </tr>`;
}

function getTableBody(list, system) {
    const dbUserId = system.getStorage('dbUserId').toString();
    return [{
        username: 'PRACTICE',
        siteId: 100,
        environment: '',
        _id: "0"
    }].concat(list).map(item => {
        return createItem(item, dbUserId)
    }).join('');
}

export default async function () {
    const { system } = this;
    const iWindow = Node('<i-window width="500" height="400" data-title="USERS"></i-window>');
    iWindow.autoPositioning(system, 'usersWindow');
    document.body.appendChild(iWindow);

    const TABLE = 'users';
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
                <th><div>username</div></th>
                <th><div>environment</div></th>
                <th><div>domain</div></th>
                <th><div>selected</div></th>
                <th><div>&nbsp;</div></th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </form>
    `);

    content.addEventListener('click', function () {
        system.setStorage({ dbUserId: content.selection.value });
    });

    const dispose = connect({ list, filter }, ({ list, filter }) => {
        content.querySelector('tbody').innerHTML = getTableBody(list.get()
            .filter(item => item.username.match(new RegExp(filter.get(), 'i'))), system);
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
};
