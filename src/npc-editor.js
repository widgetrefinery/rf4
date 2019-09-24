import './npc-editor.css';
import m from 'mithril';
import Npc from './npc';

class GiftField {
    constructor(vnode) {
        this._gifts = vnode.attrs.npc.gifts;
        this._gift = vnode.attrs.gift;
    }

    _disabled() {
        let count = 0;
        for (let gift of this._gifts) {
            if (Npc.giftStates.SHOW === gift.state) {
                count++;
            }
        }
        return 3 <= count && Npc.giftStates.SHOW !== this._gift.state;
    }

    _toggle(e) {
        let value = e.srcElement.checked;
        if (value) {
            if (!this._disabled()) {
                this._gift.state = Npc.giftStates.SHOW;
            }
        } else {
            this._gift.state = Npc.giftStates.HIDE;
        }
    }

    view() {
        let cls = 'checkbox';
        let checked = Npc.giftStates.SHOW === this._gift.state;
        let disabled = this._disabled();
        if (checked) {
            cls += ' checked';
        }
        if (disabled) {
            cls += ' disabled';
        }
        return m('li', { class: 'gift ' + this._gift.response }, [
            m('label', { class: cls, tabindex: 0 }, [
                m('input', {
                    type: 'checkbox',
                    disabled: disabled,
                    checked: checked,
                    onchange: e => this._toggle(e)
                }),
                m('span', this._gift.name)
            ])
        ]);
    }
}

class NpcEditor {
    constructor(vnode) {
        this._npc = Npc.get(vnode.attrs.key);
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
            }, Object.values(Npc.states).map(x => m('option', { key: x, value: x }, x))),
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
