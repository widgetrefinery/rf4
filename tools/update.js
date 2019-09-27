#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const path = require('path');
const readline = require('readline');

class App {
    constructor() {
        this._basedir = path.dirname(__dirname);
        this._tmpdir = path.join(this._basedir, 'tmp');
        this._npcFile = path.join(this._basedir, 'src', 'npc.json');
        if (!fs.existsSync(this._tmpdir)) {
            fs.mkdirSync(this._tmpdir);
        }
    }

    async run() {
        const npcs = await this._get_npcs();
        fs.writeFileSync(this._npcFile, JSON.stringify(npcs, null, 4));
    }

    async _get_npcs() {
        const data = await this._download('Characters_(RF4)');
        const linkRegex = /\|\s*link\s*=\s*([^|]+?)\s*$/;
        const npcs = [];
        let type = undefined;
        for await (const line of data) {
            if (line.startsWith('==') && line.endsWith('==')) {
                type = line.substring(2, line.length - 2).trim();
                continue;
            }
            if ('Main Characters' === type) {
                continue;
            }
            let link = linkRegex.exec(line);
            if (link) {
                const npc = await this.get_npc(link[1], type);
                npcs.push(npc);
            }
        }
        return npcs;
    }

    async get_npc(link, type) {
        const data = await this._download(link.replace(' ', '_'));
        const loveRegex = /^\|\s*LovedGifts\s*=\s*(.+)$/;
        const likeRegex = /^\|\s*LikedGifts\s*=\s*(.+)$/;
        const npc = { name: link.replace(' (RF4)', ''), type: type, love: [], like: [] };
        let section = undefined;
        let giftSection = undefined;
        for await (const line of data) {
            if (line.startsWith('==') && line.endsWith('==')) {
                section = line.substring(2, line.length - 2).trim();
                continue;
            }
            if ('Gifts' !== section) {
                continue;
            }
            let love = loveRegex.exec(line);
            if (love) {
                npc.love = npc.love.concat(this._parse_gifts(love[1]));
                continue;
            }
            let like = likeRegex.exec(line);
            if (like) {
                npc.like = npc.like.concat(this._parse_gifts(like[1]));
                continue;
            }
            // alternate style
            if (line.match(/'''Favorite Gifts?:'''/)) {
                giftSection = 'love';
                continue;
            }
            if ("'''Likes:'''" === line) {
                giftSection = 'like';
                continue;
            }
            if ("'''Neutral:'''" === line && "'''Dislikes:'''" === line) {
                giftSection = undefined;
                continue;
            }
            if (giftSection && line && !line.startsWith("'") && !line.startsWith('"')) {
                npc[giftSection] = npc[giftSection].concat(this._parse_gifts(line));
                continue;
            }
            // special parsing for Ventuswill
            if (line.startsWith('Likes:')) {
                like = line.substring(6);
                npc.like = npc.like.concat(this._parse_gifts(like));
            }
        }
        return npc;
    }

    _parse_gifts(gifts) {
        return gifts.split(/,|}}\s*{{/).map(x => this._parse_gift(x)).filter(x => x);
    }

    _parse_gift(gift) {
        gift = gift.trim();
        if (gift.startsWith('{{') || gift.startsWith('[[')) {
            gift = gift.substring(2);
        }
        if (gift.endsWith('}}') || gift.endsWith(']]')) {
            gift = gift.substring(0, gift.length - 2);
        }
        const offset = gift.indexOf('|');
        if (0 < offset) {
            const prefix = gift.substring(0, offset - 1);
            gift = gift.substring(offset + 1);
        }
        return gift.trim();
    }

    _download(name) {
        return new Promise(resolve => {
            const file = path.join(this._tmpdir, name);
            if (fs.existsSync(file)) {
                console.debug('using cached data: ' + name);
                const stream = fs.createReadStream(file);
                const ri = readline.createInterface({ input: stream });
                resolve(ri);
                return;
            }
            console.debug('downloading data: ' + name);
            const url = `https://therunefactory.fandom.com/wiki/${name}?action=raw`;
            https.get(url, r => {
                r.pipe(fs.createWriteStream(file));
                r.on('end', () => {
                    const stream = fs.createReadStream(file);
                    const ri = readline.createInterface({ input: stream });
                    resolve(ri);
                });
            });
        });
    }
}

async function main() {
    await new App().run();
}

main();
