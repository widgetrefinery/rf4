import rawNpcs from './npc.json';
import uniqueArray from './unique-array';

const state = loadState();
const npcs = loadNpcs();
npcs.types = getTypes(npcs);
npcs.gifts = getGifts(npcs);

function compareName(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function loadState() {
    const state = window.localStorage.getItem('npcs');
    return state ? JSON.parse(state) : {};
}

function saveState() {
    window.localStorage.setItem('npcs', JSON.stringify(state));
}

function setBoolean(obj, key, value) {
    if (value) {
        obj[key] = true;
    } else {
        delete obj[key];
    }
    saveState();
}

function loadNpcs() {
    const npcsState = state;
    const npcs = uniqueArray(v => v.name);
    for (const type in rawNpcs) {
        if (!rawNpcs.hasOwnProperty(type)) {
            continue;
        }
        const list = rawNpcs[type];
        for (let npc of list) {
            if (!npcsState[npc.name]) {
                npcsState[npc.name] = {};
            }
            npc = loadNpc(npc, type, npcsState[npc.name]);
            npcs.add(npc);
        }
    }
    npcs.sort(compareName);
    return npcs;
}

function loadNpc(npc, type, npcState) {
    Object.defineProperty(npc, 'show', {
        get: () => npcState.show,
        set: v => setBoolean(npcState, 'show', v)
    });
    Object.defineProperty(npc, 'gifted', {
        get: () => npcState.gifted,
        set: v => setBoolean(npcState, 'gifted', v)
    });
    npc.type = type;
    npc.gifts = loadGifts(npc, npcState);
    return npc;
}

function loadGifts(npc, npcState) {
    if (!npcState.gifts) {
        npcState.gifts = {};
    }
    const gifts = uniqueArray(v => v.name);
    for (const response of ['love', 'like']) {
        for (const name of npc[response]) {
            const gift = loadGift(name, response, npcState.gifts);
            gifts.add(gift);
        }
    }
    gifts.sort(compareName);
    return gifts;
}

function loadGift(name, response, giftsState) {
    return {
        name: name,
        response: response,
        get show() { return giftsState[name]; },
        set show(value) { setBoolean(giftsState, name, value); }
    };
}

function getTypes(npcs) {
    const types = uniqueArray(v => v);
    npcs.forEach(x => types.add(x.type));
    types.sort();
    return types;
}

function getGifts(npcs) {
    const gifts = uniqueArray(v => v);
    npcs.forEach(x => x.gifts.forEach(x => gifts.add(x.name)));
    gifts.sort();
    return gifts;
}

export default npcs;
