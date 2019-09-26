import rawNpcs from './npc.json';

var state = loadState();
var npcs = loadNpcs();
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
    let state = window.localStorage.getItem('npcs');
    return state ? JSON.parse(state) : {};
}

function saveState() {
    window.localStorage.setItem('npcs', JSON.stringify(state));
}

function loadNpcs() {
    let npcsState = state;
    let index = {};
    let list = [];
    for (let npc of rawNpcs) {
        if (!npcsState[npc.name]) {
            npcsState[npc.name] = {};
        }
        npc = loadNpc(npc, npcsState[npc.name]);
        index[npc.name] = npc;
        list.push(npc);
    }
    list.sort(compareName);
    list.get = x => index[x];
    return list;
}

function loadNpc(npc, npcState) {
    Object.defineProperty(npc, 'show', {
        get: function () { return npcState.show; },
        set: function (value) { npcState.show = value; saveState(); }
    });
    Object.defineProperty(npc, 'gifted', {
        get: function () { return npcState.gifted; },
        set: function (value) { npcState.gifted = value; saveState(); }
    });
    npc.gifts = loadGifts(npc, npcState);
    return npc;
}

function loadGifts(npc, npcState) {
    if (!npcState.gifts) {
        npcState.gifts = {};
    }
    let index = {};
    let list = [];
    for (let response of ['love', 'like']) {
        for (let name of npc[response]) {
            let gift = loadGift(name, response, npcState.gifts);
            index[name] = gift;
            list.push(gift);
        }
    }
    list.sort(compareName);
    list.get = x => index[x];
    return list;
}

function loadGift(name, response, giftsState) {
    let gift = {
        name: name,
        response: response,
        get show() { return giftsState[name]; },
        set show(value) { giftsState[name] = value; saveState(); }
    };
    return gift;
}

function getTypes(npcs) {
    let index = {};
    let list = [];
    for (let npc of npcs) {
        let type = npc.type;
        if (!index[type]) {
            index[type] = true;
            list.push(type);
        }
    }
    list.sort();
    return list;
}

function getGifts(npcs) {
    let index = {};
    let list = [];
    for (let npc of npcs) {
        for (let gift of npc.gifts) {
            let name = gift.name;
            if (!index[name]) {
                index[name] = true;
                list.push(name);
            }
        }
    }
    list.sort();
    return list;
}

export default npcs;
