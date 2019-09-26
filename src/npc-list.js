import './npc-list.css';
import m from 'mithril';
import Checkbox from './checkbox';
import Npc from './npc';

const NpcEntry = {
    view(vnode) {
        let npc = vnode.attrs.npc;
        return m('li', { class: 'npc-entry', tabindex: 0 }, [
            m('div', { class: 'name' }, [
                m(Checkbox, {
                    checked: npc.gifted,
                    disabled: !npc.show,
                    onchange: v => npc.gifted = v
                }),
                m('span', npc.name),
                m('a', { class: 'edit', href: '#/npc/' + npc.name }, '✎'),
            ]),
            m('div', { class: 'gifts' }, npc.gifts.filter(x => x.show)
                .map(x => m('div', { class: 'gift ' + x.response }, x.name)))
        ]);
    }
}

class NpcList {
    constructor() {
        this._types = [''].concat(Npc.types);
        this._type = this._types[0];
        this._gifts = [''].concat(Npc.gifts);
        this._gift = this._gifts[0];
        this._states = ['all', 'visible', 'gifted', 'need-gift'];
        this._state = this._states[0];
    }

    _include(npc) {
        if ('all' !== this._state && !npc.show) {
            return false;
        }
        if ('gifted' === this._state && !npc.gifted) {
            return false;
        }
        if ('need-gift' === this._state && npc.gifted) {
            return false;
        }
        return ('' === this._type || npc.type === this._type)
            && ('' === this._gift || npc.gifts.get(this._gift));
    }

    _ungiftAll() {
        Npc.forEach(x => x.gifted = false);
    }

    view() {
        return m('div', { id: 'npc-list' }, [
            m('label', 'Type:'),
            m('select', {
                value: this._type,
                onchange: e => this._type = e.srcElement.value
            }, this._types.map(x => m('option', { key: x, value: x }, x))),
            m('label', 'Gift:'),
            m('select', {
                value: this._gift,
                onchange: e => this._gift = e.srcElement.value
            }, this._gifts.map(x => m('option', { key: x, value: x }, x))),
            m('label', 'Show:'),
            m('select', {
                value: this._state,
                onchange: e => this._state = e.srcElement.value
            }, this._states.map(x => m('option', { key: x, value: x }, x))),
            m('ul', Npc.filter(x => this._include(x))
                .map(x => m(NpcEntry, { key: x.name, npc: x }))),
            m('div', { class: 'btns' }, [
                m('button', { class: 'btn', onclick: () => this._ungiftAll() }, 'Ungift All')
            ])
        ]);
    }
}

export default NpcList;
