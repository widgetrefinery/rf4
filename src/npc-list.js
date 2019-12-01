import './npc-list.css';
import m from 'mithril';
import Checkbox from './checkbox';
import Npc from './npc';

class NpcEntry {
    constructor(vnode) {
        this._npc = vnode.attrs.npc;
        this._open = false;
    }

    view() {
        const npc = this._npc;
        return m('li', { class: 'npc-entry' + (this._open ? ' open' : '') }, [
            m('div', { class: 'name' + (npc.show ? '' : ' disabled') }, [
                m('span', {
                    onclick: () => this._open = !this._open
                }, npc.name),
                m(Checkbox, {
                    checked: npc.gifted,
                    disabled: !npc.show,
                    onchange: v => npc.gifted = v
                }),
                m('a', {
                    class: 'edit',
                    href: '#/npc/' + npc.name
                }, '✎'),
            ]),
            npc.gifts.filter(x => x.show)
                .map(x => m('div', { class: 'gift ' + x.response }, x.name))
        ]);
    }
}

class NpcList {
    constructor() {
        this._types = Npc.types;
        if (!this._types.value) {
            this._types.value = this._types[0];
        }
        this._gifts = Npc.gifts;
        if (!this._gifts.value) {
            this._gifts.value = this._gifts[0];
        }
        this._states = Npc.states;
        if (!this._states.value) {
            this._states.value = this._states[0];
        }
    }

    _include(npc) {
        if ('All' !== this._states.value && !npc.show) {
            return false;
        }
        if ('Gifted' === this._states.value && !npc.gifted) {
            return false;
        }
        if ('Need Gift' === this._states.value && npc.gifted) {
            return false;
        }
        return ('All' === this._types.value || npc.type === this._types.value)
            && ('All' === this._gifts.value || npc.gifts.get(this._gifts.value));
    }

    _ungiftAll() {
        if (window.confirm('Really ungift everyone?')) {
            Npc.forEach(x => x.gifted = false);
        }
    }

    view() {
        return m('div', { id: 'npc-list' }, [
            m('label', 'Type:'),
            m('select', {
                value: this._types.value,
                onchange: e => this._types.value = e.srcElement.value
            }, this._types.map(x => m('option', { key: x, value: x }, x))),
            m('label', 'Gift:'),
            m('select', {
                value: this._gifts.value,
                onchange: e => this._gifts.value = e.srcElement.value
            }, this._gifts.map(x => m('option', { key: x, value: x }, x))),
            m('label', 'State:'),
            m('select', {
                value: this._states.value,
                onchange: e => this._states.value = e.srcElement.value
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
