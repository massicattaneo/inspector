import { downLoadJsonFile, Node } from '../../utils/html-utils';
import { WIZARD } from '../../core/constants';

export default function() {
    const { params, thread, system } = this;
    const iWindow = Node('<i-window width="800" height="600" data-title="EDIT"></i-window>');
    iWindow.autoPositioning(system, 'editWindow');
    document.body.appendChild(iWindow);
    const content = iWindow.appendContent(`
<div style="height: 100%;">
    <div>
        <button type="button" class="download">DOWNLOAD</button>
        <button type="button" class="save">SAVE CHANGES</button>
        <button type="button" class="exit">EXIT REPLAY MODE</button>
    </div>
    <br/>
    <div id="jsoneditor" style="width: 100%; height: calc(100% - 60px); background: white;"></div>
</div>`);
    const container = content.querySelector('#jsoneditor');
    const options = {
        mainMenuBar: true,
        statusBar: true,
        navigationBar: true
    };
    content.querySelector('.save').addEventListener('click', () => system.setStorage({ recording: editor.get() }));
    content.querySelector('.exit').addEventListener('click', () => {
        system.removeStorage('recording');
        thread.main('api/reload');
    });

    if (window.JSONEditor) {
        const editor = new JSONEditor(container, options);
        editor.set(params);
        content.querySelector('.download').addEventListener('click', async () => {
            const { title } = await this.thread.main(
                'dialog/wizard',
                {
                    list: [{ type: WIZARD.TYPES.TEXT, placeholder: 'title' }]
                },
                'body'
            )();
            downLoadJsonFile(params, title, editor.get());
        });
    }


    function destroy() {
        iWindow.removeEventListener('close', destroy);
    }
    iWindow.addEventListener('close', destroy);
}
