import { Node } from '../../utils/html-utils';

export default async function({ list }, selector = '#logged') {
    const dialog = Node('<i-dialog></i-dialog>');
    const wizard = Node('<i-wizard></i-wizard>');
    dialog.show(wizard);
    document.querySelector(selector).appendChild(dialog);
    const res = await wizard.start(list);
    dialog.close();
    return res;
}
