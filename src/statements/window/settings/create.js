import { WIZARD, INTERACTIONS } from '../../../core/constants';

export default async function (body) {
    const list = [
        {
            type: WIZARD.TYPES.SELECT,
            placeholder: 'interaction',
            list: Object.keys(INTERACTIONS).map(key => ({
                value: INTERACTIONS[key],
                label: key.replace(/_/g, ' ')
            }))
        },
        { type: WIZARD.TYPES.TEXT, placeholder: 'match' }
    ];

    const settings = body || (await this.thread.main('dialog/wizard', { list }, 'body')());
    this.db.insert('settings', settings);
};
