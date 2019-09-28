const getRawPage = require('./get-raw-page');

const SWITCH_REGEX = /^{{#switch: {{{(\d+)}}}\|yes=.*\[\[(.+)]]\|}}$/;
const CACHE = {};

async function get(text) {
    if (!text.startsWith('{{') || !text.endsWith('}}')) {
        return [text];
    }
    const args = text.substring(2, text.length - 2).split('|');
    const name = args.shift();
    const template = await getTemplate(name);
    return template(args);
}

async function getTemplate(name) {
    if (!CACHE[name]) {
        const text = await getRawPage('Template:' + name);
        CACHE[name] = parseTemplate(text);
    }
    return CACHE[name];
}

function parseTemplate(text) {
    const config = {};
    let offset = 0;
    let nesting = 0;
    for (let i = 0; text.length > i; i++) {
        const c = text[i];
        if ('{' === c || '[' === c || '<' === c) {
            nesting++;
        } else if ('}' === c || ']' === c || '>' === c) {
            nesting--;
        }
        if (0 === nesting) {
            parseTemplateFunction(text.substring(offset, 1 + i), config);
            offset = 1 + i;
        }
    }
    if (offset < text.length) {
        parseTemplateFunction(text.substring(offset), config);
    }
    return function (args) {
        const values = [];
        for (let i = 0; args.length > i; i++) {
            const key = i;
            const value = args[i];
            if ('yes' === value && config[key]) {
                values.push(config[key]);
            }
        }
        return values;
    };
}

function parseTemplateFunction(text, config) {
    const matches = SWITCH_REGEX.exec(text);
    if (matches) {
        const key = parseInt(matches[1]) - 1;
        const value = matches[2];
        config[key] = value;
    }
}

module.exports = get;
