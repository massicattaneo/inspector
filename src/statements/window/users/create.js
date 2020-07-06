import { WIZARD, ENVIRONMENTS } from '../../../core/constants';

export default async function (body) {
    const list = [
        { type: WIZARD.TYPES.TEXT, placeholder: 'username' },
        { type: WIZARD.TYPES.PASSWORD, placeholder: 'password' },
        {
            type: WIZARD.TYPES.SELECT,
            placeholder: 'environment',
            list: Object.keys(ENVIRONMENTS).map(key => ENVIRONMENTS[key])
        }
    ];

    const user = body || (await this.thread.main('dialog/wizard', { list }, 'body')());
    this.db.insert('users', user);
};
