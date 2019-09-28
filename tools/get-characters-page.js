const getRawPage = require('./get-raw-page');

const LINK_REGEX = /\|\s*link\s*=\s*([^|]+?)\s*$/;

async function get() {
    const text = await getRawPage('Characters_(RF4)');
    const npcs = [];
    let heading = undefined;
    for (const line of text.split('\n')) {
        // search for headings
        if (line.startsWith('==') && line.endsWith('==')) {
            heading = line.substring(2, line.length - 2).trim();
            continue;
        }
        if (!heading || 'Main Characters' === heading) {
            continue;
        }
        // search for links to individual characters
        const link = LINK_REGEX.exec(line);
        if (link) {
            npcs.push({
                type: heading,
                name: link[1].replace(' (RF4)', ''),
                link: link[1]
            });
        }
    }
    return npcs;
}

module.exports = get;
