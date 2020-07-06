import { Stack } from '../../core/Stack';
import { INTERACTIONS } from '../../core/constants';

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default async function () {
    const stack = Stack();
    const { store } = this;

    const get = table => {
        return new Promise(resolve => {
            stack.run(function (next) {
                const objectStore = this.db.transaction(table, 'readwrite').objectStore(table);
                objectStore.getAll().onsuccess = event => {
                    resolve(event.target.result);
                    next();
                };
            });
        });
    };

    const insert = (table, document) => {
        return new Promise(resolve => {
            stack.run(function (next) {
                const data = [].concat(Object.assign({ _id: uuidv4() }, document));
                const customerObjectStore = this.db.transaction(table, 'readwrite').objectStore(table);
                data.forEach(item => customerObjectStore.add(item));
                store.tables[table].list.unshift(...data);
                resolve();
                next();
            });
        });
    };

    const remove = function (table, id) {
        return new Promise(resolve => {
            stack.run(function (next) {
                const objectStore = this.db.transaction(table, 'readwrite').objectStore(table);
                objectStore.delete(id).onsuccess = () => {
                    resolve();
                    next();
                };
            });
        });
    };

    stack.run(function (next) {
        const request = window.indexedDB.open('inspector', 1);
        const tables = ['users', 'settings'];

        request.onsuccess = event => {
            this.db = event.target.result;
            if (event.target.result.objectStoreNames.contains(tables[0])) next();
        };
        request.onupgradeneeded = () => {
            this.db = request.result;
            Promise.all(tables.map(table => new Promise(resolve => {
                this.db.createObjectStore(table, { keyPath: '_id' });
                setTimeout(resolve, 50);
            }))).then(() => {
                next();
                insert('settings', { interaction: INTERACTIONS.HTTP_REQUEST, match: '/services' });
                insert('settings', { interaction: INTERACTIONS.WS_MESSAGE, match: '/services' });
                insert('settings', { interaction: INTERACTIONS.WS_MESSAGE, match: 'viggames' });
                insert('settings', { interaction: INTERACTIONS.WS_MESSAGE, match: 'ldintegration' });
            });
        };
    });

    get('users').then(data => store.tables.users.list.push(...data));
    await get('settings').then(data => store.tables.settings.list.push(...data));

    return {
        db: {
            get,
            insert,
            remove
        }
    };
}
