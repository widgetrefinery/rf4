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

export default uniqueArray;
