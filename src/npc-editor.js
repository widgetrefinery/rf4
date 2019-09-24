import m from 'mithril';
import npc from './npc';

class GiftField {
    constructor(vnode) {
        this._gifts = vnode.attrs.npc.gifts;
        this._gift = vnode.attrs.gift;
    }

    _disabled() {
        let count = 0;
        for (let gift of this._gifts) {
            if (npc.giftStates.SHOW === gift.state) {
                count++;
            }
        }
        return 3 <= count && npc.giftStates.SHOW !== this._gift.state;
    }

    _toggle(e) {
        let value = e.srcElement.checked;
        if (value) {
            if (!this._disabled()) {
                this._gift.state = npc.giftStates.SHOW;
            }
        } else {
            this._gift.state = npc.giftStates.HIDE;
        }
    }

    view() {
        return m('li', { class: 'gift ' + this._gift.response }, [
            m('label', { tabindex: 0 }, [
                m('input', {
                    type: 'checkbox',
                    disabled: this._disabled(),
                    checked: npc.giftStates.SHOW === this._gift.state,
                    onchange: e => this._toggle(e)
                }),
                m('span', this._gift.name)
            ])
        ]);
    }
}

class NpcEditor {
    constructor(vnode) {
        this._npc = npc.get(vnode.attrs.key);
    }

    _setState(e) {
        this._npc.state = e.srcElement.value;
    }

    view() {
        return m('div', { id: 'npc-editor' }, [
            m('label', 'Name:'),
            m('span', this._npc.name),
            m('label', 'Type:'),
            m('span', this._npc.type),
            m('label', 'State:'),
            m('select', {
                value: this._npc.state,
                onchange: e => this._setState(e)
            }, Object.values(npc.states).map(x => m('option', { key: x, value: x }, x))),
            m('label', 'Gifts:'),
            m('ul', this._npc.gifts.map(x => m(GiftField, {
                key: x.name,
                npc: this._npc,
                gift: x
            }))),
            m('a', { class: 'btn', href: '#/npc' }, 'Ok')
        ]);
    }
}

export default NpcEditor;
