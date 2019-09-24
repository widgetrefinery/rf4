import './index.css';
import m from 'mithril';
import NpcList from './npc-list';
import NpcEditor from './npc-editor';

m.route(document.body, '/npc', {
    '/npc': NpcList,
    '/npc/:key': NpcEditor
});