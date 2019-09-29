const getRawPage = require('./get-raw-page');
const getTemplate = require('./get-template');

const TEXT_HEADING_REGEX = /'''([^:']+):'''$/;

function uniqueArray(valueToKey) {
    const index = {};
    const list = [];
    list.add = v => {
        const key = valueToKey(v);
        if (!index[key]) {
            index[key] = v;
            list.push(v);
        }
        return list;
    };
    list.get = v => index[v];
    return list;
}

async function get({ name, link }) {
    const text = await getRawPage(link);
    const npc = { name: name, love: uniqueArray(v => v), like: uniqueArray(v => v) };
    // get the start/end offsets for the Gifts section
    const giftsSectionStart = text.indexOf('\n==Gifts==\n');
    if (0 > giftsSectionStart) {
        return undefined;
    }
    let giftsSectionEnd = text.indexOf('\n==', 11 + giftsSectionStart);
    if (0 > giftsSectionEnd) {
        giftsSectionEnd = text.length;
    }
    // parse the Gifts section
    const giftsTemplateOffsets = await parseGiftsTemplate(text, giftsSectionStart, giftsSectionEnd, npc);
    if (giftsTemplateOffsets) {
        await parseText(text, giftsSectionStart, giftsTemplateOffsets[0], npc);
        await parseText(text, giftsTemplateOffsets[1], giftsSectionEnd, npc);
    } else {
        await parseText(text, giftsSectionStart, giftsSectionEnd, npc);
    }
    return 0 < npc.love.length || 0 < npc.like.length ? npc : undefined;
}

async function parseGiftsTemplate(text, start, end, npc) {
    const templateStart = text.indexOf('{{Gifts', start);
    if (0 > templateStart) {
        return undefined;
    }
    let offset = 2 + templateStart;
    let nesting = [];
    for (let i = templateStart; end > i; i++) {
        const c = text[i];
        if ('{' === c) {
            nesting.push('}');
        } else if ('[' === c) {
            nesting.push(']');
        } else if ('<' === c) {
            nesting.push('>');
        } else if (0 < nesting.length && nesting[nesting.length - 1] === c) {
            nesting.pop();
            if (0 === nesting.length) {
                return [templateStart, 1 + i];
            }
        } else if ('|' === c && 2 === nesting.length) {
            await parseGiftsTemplateParameter(text.substring(offset, i), npc);
            offset = 1 + i;
        }
    }
    console.warn('Gifts template was not closed properly');
    return [templateStart, end];
}

async function parseGiftsTemplateParameter(text, npc) {
    const parts = text.split('=', 2);
    if (2 !== parts.length) {
        return;
    }
    const key = parts[0].trim();
    const value = parts[1];
    if ('LovedGifts' === key) {
        await parseGifts(value, npc.love);
    } else if ('LikedGifts' === key) {
        await parseGifts(value, npc.like);
    }
}

async function parseText(text, start, end, npc) {
    let gifts = undefined;
    for (const line of text.substring(start, end).split('\n')) {
        const matches = TEXT_HEADING_REGEX.exec(line);
        if (matches) {
            const heading = matches[1];
            if ('Favorite Gifts' === heading || 'Favorite Gift' === heading) {
                gifts = npc.love;
            } else if ('Likes' === heading) {
                gifts = npc.like;
            } else {
                gifts = undefined;
            }
        } else if (line.startsWith('Favorite Gifts:')) {
            // special parsing for Ventuswill
            await parseGifts(line.substring('Favorite Gifts:'.length), npc.love);
        } else if (line.startsWith('Likes:')) {
            // special parsing for Ventuswill
            await parseGifts(line.substring('Likes:'.length), npc.like);
        } else if (gifts && !line.startsWith('"') && !line.startsWith("'")) {
            await parseGifts(line, gifts);
        }
    }
}

async function parseGifts(text, gifts) {
    let offset = 0;
    while (offset < text.length) {
        const c = text[offset];
        if (' ' === c || ',' === c || '\n' === c) {
            offset++;
            continue;
        }
        let nextOffset;
        if (text.startsWith('{{', offset)) {
            nextOffset = text.indexOf('}}', offset);
            nextOffset = 0 < nextOffset ? 2 + nextOffset : text.length;
        } else if (text.startsWith('[[', offset)) {
            nextOffset = text.indexOf(']]', offset);
            nextOffset = 0 < nextOffset ? 2 + nextOffset : text.length;
        } else {
            let nextComma = text.indexOf(',', offset);
            let nextNewline = text.indexOf('\n', offset);
            nextComma = 0 < nextComma ? nextComma : text.length;
            nextNewline = 0 < nextNewline ? nextNewline : text.length;
            nextOffset = Math.min(nextComma, nextNewline);
        }
        await parseGift(text.substring(offset, nextOffset), gifts);
        offset = nextOffset;
    }
}

async function parseGift(text, gifts) {
    if (text.startsWith('{{RF4I|') && text.endsWith('}}')) {
        text = text.substring(1 + text.indexOf('|'), text.length - 2);
    } else if (text.startsWith('{{') && text.endsWith('}}')) {
        for (const gift of await getTemplate(text)) {
            gifts.add(gift);
        }
        return;
    }
    if ('*' === text[0]) {
        text = text.substring(1);
    }
    if (text.startsWith('[[') && text.endsWith(']]')) {
        text = text.substring(2, text.length - 2);
    }
    // remove extra close parenthesis on Amber's Emery Flower
    if (text.endsWith(')') && 0 > text.indexOf('(')) {
        text = text.substring(0, text.length - 1);
    }
    text = text.trim();
    if (text) {
        gifts.add(text);
    }
}

module.exports = get;
