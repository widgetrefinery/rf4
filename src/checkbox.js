import './checkbox.css';
import m from 'mithril';

const checkbox = {
    view(vnode) {
        let checked = vnode.attrs.checked;
        let disabled = vnode.attrs.disabled;
        let label = vnode.attrs.label;
        let onchange = vnode.attrs.onchange;
        return m('span', {
            class: 'checkbox' + (checked ? ' checked' : '') + (disabled ? ' disabled' : ''),
            tabindex: 0,
            onclick: () => onchange(!checked)
        }, label);
    }
}

export default checkbox;