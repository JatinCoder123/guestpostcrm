const viewMails = {};
const ledgers = {};
const contacts = {};

const cacheStore = {
    viewMails,
    ledgers,
    contacts,
};


export const setCache = (section, email, data) => {
    if (!cacheStore[section]) {
        console.warn(`Invalid cache section: ${section}`);
        return;
    }

    cacheStore[section][email] = data;
};

export const getCache = (section, email) => {
    if (!cacheStore[section]) {
        console.warn(`Invalid cache section: ${section}`);
        return null;
    }

    return cacheStore[section][email] || null;
};


export const clearCache = (section, email) => {
    if (cacheStore[section]?.[email]) {
        delete cacheStore[section][email];
    }
};


export const clearSectionCache = (section) => {
    if (cacheStore[section]) {
        cacheStore[section] = {};
    }
};