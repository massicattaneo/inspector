import { copyTextToClipboard, Node } from '../../utils/html-utils';
import { connect, create } from '../../core/Reactive';
import { arrayUtils, createJiraTable, getElementPath } from '../../core/core-utils';

const { mapProperty, removeDuplicates, removeEmpty } = arrayUtils;

function createItem({ gameId, component = '', name, vendor }) {
    return `<tr data-id="${gameId}">
                <td>${gameId}</td>
                <td>${name}</td>
                <td>${vendor}</td>
                <td>${component}</td>
            </tr>`;
}

function filterList(list, select, filter) {
    return list.get()
        .filter(item => item.name.indexOf('(flash)') === -1)
        .filter(item => select.value ? item.component === select.value : true)
        .filter(item => item.name.match(new RegExp(filter.get(), 'i')))
        .sort((first, second) => first.gameId - second.gameId);
}

export default async function () {
    const { system } = this;
    const iWindow = Node('<i-window width="500" height="400" data-title="GAMES"></i-window>');
    iWindow.autoPositioning(system, 'gamesWindow');
    document.body.appendChild(iWindow);

    const TABLE = `games`;
    const { list, filter } = this.store.tables[TABLE];

    const menu = Node(`
    <form name="menu" autocomplete="off">
        <select name="component" class="select" style="width: auto; font-size: 12px"></select>
        <input type="search" class="search" name="search" placeholder="search" style="width: 200px"/>
        <span class="fa copy header"></span>
    </form>
    `);
    iWindow.appendMenu(menu);

    const content = Node(`
    <table width="100%" class="alternate-table">
            <thead>
            <tr>
                <th><div>gameId</div></th>
                <th><div>name</div></th>
                <th><div>vendor</div></th>
                <th><div>component</div></th>
            </tr>
            </thead>
            <tbody></tbody>
        </table>
    `);

    iWindow.listener('keyup', 'search', event => {
        event.preventDefault();
        const path = getElementPath(event.target);
        filter.set(path[0].value);
    });

    iWindow.listener('change', 'select', event => {
        event.preventDefault();
        filter.emitChange();
    });

    iWindow.listener('click', 'fa copy header', event => {
        const select = menu.querySelector('select');
        const headers = ['name', 'gameId'];
        copyTextToClipboard(createJiraTable(filterList(list, select, filter), headers));
        this.thread.main('notification/show', 'success', 'List Copied', { timeout: 2000, immediate: true })();
    });

    const htmlList = create({ items: [] });
    const dispose = connect({ list, filter }, ({ list, filter }) => {
        const select = menu.querySelector('select');
        htmlList.items.splice(0);
        htmlList.items.push(...filterList(list, select, filter)
            .map(createItem).map(Node));
    });
    const remove = connect({ list, filter }, ({ list, filter }) => {
        if (list.get().length === 0) return;
        const select = menu.querySelector('select');
        if (select.innerHTML) return remove();
        const options = removeEmpty(removeDuplicates(mapProperty(list.get(), 'component')))
            .sort()
            .map(string => `<option value="${string}">${string}</option>`).join('');
        select.innerHTML = `<option value="">All components</option>${options}`;
    });

    iWindow.addEventListener('close', dispose);

    iWindow.appendContent(content, htmlList);
};
