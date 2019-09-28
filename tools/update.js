#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const getCharacterPage = require('./get-character-page');
const getCharactersPage = require('./get-characters-page');

async function main() {
    const npcFile = path.join(path.dirname(__dirname), 'src', 'npc.json');
    const npcs = {};
    for (const rawNpc of await getCharactersPage()) {
        const npc = await getCharacterPage(rawNpc);
        if (!npc) {
            continue;
        }
        if (npcs[rawNpc.type]) {
            npcs[rawNpc.type].push(npc);
        } else {
            npcs[rawNpc.type] = [npc];
        }
    }
    fs.writeFileSync(npcFile, JSON.stringify(npcs, null, 4));
}

main();
