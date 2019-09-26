import './npc-editor.css';
import m from 'mithril';
import Checkbox from './checkbox';
import Npc from './npc';

class NpcEditor {
    constructor(vnode) {
        this._npc = Npc.get(vnode.attrs.key);
    }

    view() {
        let npc = this._npc;
        return m('div', { id: 'npc-editor' }, [
            m('label', 'Name:'),
            m('span', npc.name),
            m('label', 'Type:'),
            m('span', npc.type),
            m('label', 'Show:'),
            m(Checkbox, {
                checked: npc.show,
                label: 'show',
                onchange: v => npc.show = v
            }),
            m('label', 'Gifted:'),
            m(Checkbox, {
                checked: npc.gifted,
                label: 'gifted',
                onchange: v => npc.gifted = v
            }),
            m('label', 'Gifts:'),
            m('ul', npc.gifts.map(x => m('li', {
                class: 'gift ' + x.response
            }, m(Checkbox, {
                checked: x.show,
                label: x.name,
                onchange: v => x.show = v
            })))),
            m('a', { class: 'btn', href: '#/npc' }, 'Ok')
        ]);
    }
}

export default NpcEditor;
