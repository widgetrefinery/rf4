import data from './npc.json';

const GiftState = {
    HIDE: 'hide',
    SHOW: 'show',
};

const NpcState = {
    GIFTED: 'gifted',
    HIDE: 'hide',
    NEED_GIFT: 'need-gift',
};

function compareName(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function load(npc) {
    let giftIndex = {};
    let giftList = [];
    for (let response of ['love', 'like']) {
        for (let name of npc[response]) {
            let gift = { name: name, response: response, state: GiftState.HIDE };
            giftIndex[name] = gift;
            giftList.push(gift);
        }
    }
    giftList.sort(compareName);
    giftList.get = x => giftIndex[x];

    npc.state = NpcState.NEED_GIFT;
    npc.gifts = giftList;
    return npc;
}

function loadAll() {
    let npcIndex = {};
    let npcList = [];
    let typeIndex = {};
    let typeList = [];
    let giftIndex = {};
    let giftList = [];
    for (let npc of data) {
        npc = load(npc);
        npcIndex[npc.name] = npc;
        npcList.push(npc);
        let type = npc.type;
        if (!typeIndex[type]) {
            typeIndex[type] = true;
            typeList.push(type);
        }
        for (let gift of npc.gifts) {
            let name = gift.name;
            if (!giftIndex[name]) {
                giftIndex[name] = true;
                giftList.push(name);
            }
        }
    }
    npcList.sort(compareName);
    typeList.sort();
    giftList.sort();

    npcList.get = x => npcIndex[x];
    npcList.states = NpcState;
    npcList.types = typeList;
    npcList.gifts = giftList;
    npcList.giftStates = GiftState;
    return npcList;
}

export default loadAll();