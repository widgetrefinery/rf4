const fs = require('fs');
const https = require('https');
const path = require('path');

const AGENT = new https.Agent({ keepAlive: true, maxSockets: 1, maxFreeSockets: 1 });
const CACHE_DIR = path.join(path.dirname(__dirname), 'tmp');

function download(url, cacheFile) {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    return new Promise((resolve, reject) => {
        console.debug('downloading data: ' + url);
        https.get(url, { agent: AGENT }, r => {
            if (200 !== r.statusCode) {
                r.resume();
                reject('unexpected status code: ' + r.statusCode);
                return;
            }
            r.on('error', e => reject('download failed: ' + e));
            r.pipe(fs.createWriteStream(cacheFile)).on('finish', resolve);
        });
    });
}

async function get(name) {
    let cacheFile = name.replace(/[^a-zA-Z0-9()]/g, '_');
    cacheFile = path.join(CACHE_DIR, cacheFile);
    if (!fs.existsSync(cacheFile)) {
        let url = name.replace(/ /g, '_');
        url = `https://therunefactory.fandom.com/wiki/${url}?action=raw`;
        await download(url, cacheFile);
    }
    return fs.readFileSync(cacheFile, { encoding: 'utf8' });
}

module.exports = get;
