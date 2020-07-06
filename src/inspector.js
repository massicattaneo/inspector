import './inspector.css';
import { apiReplay } from './statements/apiMiddleware';
import { parseStatements } from './core/core-utils';
import { Thread } from './core/Thread';

parseStatements(require.context('./web-components/', true, /.js/));

const statements = parseStatements(require.context('./statements/', true, /.js/), '.js');
const thread = Thread(statements);

(function () {
    thread.before(apiReplay);
    thread.main()(thread.extend);
    thread.main('init/global-scope')(thread.extend);
    thread.main('init/keyboard')(thread.extend);
    const { system } = thread.main('init/system')(thread.extend);
    if (!window.inspector.params && !system.getCookie('inspector.user')) return;
    thread.main('init/block-interactions')(thread.extend);
    thread.main('init/store')(thread.extend);
    thread.main('db/init')().then(thread.extend);
    thread.main('init/vendors')();
    thread.main('init/device-setup')();
    thread.main('init/web-socket')(thread.extend);
    thread.main('init/middlewares')(thread.extend);
    thread.main('init/local-storage')(thread.extend);
    thread.main('init/web-components')(thread.extend);
})();
