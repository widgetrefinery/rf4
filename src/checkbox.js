import './checkbox.css';
import m from 'mithril';

const checkbox = {
    view(vnode) {
        const checked = vnode.attrs.checked;
        const disabled = vnode.attrs.disabled;
        const label = vnode.attrs.label;
        const onchange = vnode.attrs.onchange;
        const onclick = () => {
            if (!disabled && onchange) {
                onchange(!checked);
            }
        };
        return m('span', {
            class: 'checkbox' + (checked ? ' checked' : '') + (disabled ? ' disabled' : ''),
            tabindex: 0,
            onclick: onclick
        }, label);
    }
}

export default checkbox;
