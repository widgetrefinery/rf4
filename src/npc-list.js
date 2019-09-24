import m from 'mithril';
import Npc from './npc';

class NpcCard {
    constructor(vnode) {
        this._npc = vnode.attrs.npc;
    }

    _toggleGift() {
        if (this._npc.state === Npc.states.GIFTED) {
            this._npc.state = Npc.states.NEED_GIFT;
        } else {
            this._npc.state = Npc.states.GIFTED;
        }
    }

    view() {
        return m('li', { class: 'npc-card', tabstop: 0 }, [
            m('div', { class: 'name' }, this._npc.name),
            this._npc.gifts.filter(x => x.state === Npc.giftStates.SHOW)
                .map(x => m('div', { class: 'gift ' + x.response }, x.name)),
            m('button', {
                class: 'btn state',
                onclick: () => this._toggleGift()
            }, this._npc.state === Npc.states.GIFTED ? 'Ungift' : 'Gift'),
            m('a', {
                class: 'btn edit',
                href: '#/npc/' + this._npc.name
            }, 'Edit')
        ]);
    }
}

class NpcList {
    constructor() {
        this._types = [''].concat(Npc.types);
        this._type = this._types[0];
        this._gifts = [''].concat(Npc.gifts);
        this._gift = this._gifts[0];
        this._states = ['all', 'visible', Npc.states.NEED_GIFT, Npc.states.GIFTED];
        this._state = this._states[0];
    }

    _setType(e) {
        this._type = e.srcElement.value;
    }

    _setGift(e) {
        this._gift = e.srcElement.value;
    }

    _setState(e) {
        this._state = e.srcElement.value;
    }

    _ungiftAll() {
        Npc.filter(x => x.state === Npc.states.GIFTED)
            .forEach(x => x.state = Npc.states.NEED_GIFT);
    }

    _include(npc) {
        if (this._state === 'visible' && npc.state === Npc.states.HIDE) {
            return false;
        }
        if (this._state === Npc.states.NEED_GIFT && npc.state !== this._state) {
            return false;
        }
        if (this._state === Npc.states.GIFTED && npc.state !== this._state) {
            return false;
        }
        return ('' === this._type || npc.type === this._type)
            && ('' === this._gift || npc.gifts.get(this._gift));
    }

    view() {
        return m('div', { id: 'npc-list' }, [
            m('label', 'Type:'),
            m('select', {
                value: this._type,
                onchange: e => this._setType(e)
            }, this._types.map(x => m('option', { key: x, value: x }, x))),
            m('label', 'Gift:'),
            m('select', {
                value: this._gift,
                onchange: e => this._setGift(e)
            }, this._gifts.map(x => m('option', { key: x, value: x }, x))),
            m('label', 'State:'),
            m('select', {
                value: this._state,
                onchange: e => this._setState(e)
            }, this._states.map(x => m('option', { key: x, value: x }, x))),
            m('ul', Npc.filter(x => this._include(x))
                .map(x => m(NpcCard, { key: x.name, npc: x }))),
            m('div', { class: 'btns' }, [
                m('button', { class: 'btn', onclick: () => this._ungiftAll() }, 'Ungift All')
            ])
        ]);
    }
}

export default NpcList;
