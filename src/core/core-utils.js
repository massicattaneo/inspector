import { INTERACTIONS } from './constants';

function parseStatements(context, extension) {
    const statements = {};
    context.keys().forEach(filename => {
        statements[filename.replace('./', '').replace(extension, '')] = context(filename).default || context(filename);
    });
    return statements;
}

function parseJSON(obj) {
    if (!(obj instanceof Object)) return;
    if (Array.isArray(obj)) return;
    Object.keys(obj).forEach(function (key) {
        const objElement = obj[key];
        if (Array.isArray(obj)) return parseJSON(objElement);
        try {
            obj[key] = JSON.parse(objElement);
        } catch (e) {
        }
        parseJSON(objElement);
    });
    return obj;
}

function createInspectorListItem(data, {
    mousePosition = { x: 0, y: 0 },
    timestamps = { start: Date.now(), end: Date.now(), duration: 0 }
} = {}) {
    if (!data.timestamps) {
        Object.assign(data, { timestamps });
    }

    return Object.assign({}, parseJSON(data), { mousePosition });
}

const arrayUtils = {
    mapProperty(array, propertyName) {
        return array.map(item => item[propertyName]);
    },
    removeDuplicates(array) {
        return array.filter((item, index, array) => array.indexOf(item) === index);
    },
    removeEmpty(array) {
        return array.filter(item => item);
    }
};

const stringUtils = {
    padLeft: function padLeft(str, size, char = '0') {
        if (size === 0) {
            return '';
        }
        return (Array(size + 1).join(char) + str).slice(-size);
    }
};

function getUrlParameter(name, url) {
    const match = new RegExp(`[?|&]${name}=([^&;]+?)(&|#|;|$)`).exec(url) || [null, ''];
    if (!match && !match[1]) return '';
    return decodeURIComponent(match[1]).replace(/\+/g, '%20') || null;
}

function formatChronograph(start, end = Date.now(), addMilliseconds = true) {
    const distance = end - start;
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const ms = Math.floor(distance % 1000);
    const milliSecs = addMilliseconds ? `:${stringUtils.padLeft(ms, 3)}` : '';
    return `${stringUtils.padLeft(minutes, 2)}:${stringUtils.padLeft(seconds, 2)}${milliSecs}`;
}

function queryParamsToObject(userSuppliedParams, mapping = arr => arr) {
    return userSuppliedParams
        .replace(/^\?/, '')
        .split('&')
        .map(parameter => parameter.split('='))
        .map(mapping)
        .reduce((accumulator, [key, value]) => {
            return Object.assign(accumulator, { [key]: value });
        }, {});
}

function getSafePostMessage(event) {
    let ret = {};
    try {
        ret = JSON.parse(event.data);
    } catch (e) {
        ret = {};
    }
    return ret;
}

function getReplayTimeline({ recordingData }, { start = Date.now(), beforeAssetLoaded = false } = {}) {
    const gap = start - recordingData[0].timestamps.start;
    const assetLoadedItem = recordingData.find(item => item.interaction === INTERACTIONS.ASSETS_LOADED);
    const assetLoadedIndex = recordingData.indexOf(assetLoadedItem);
    return recordingData
        .filter((item, index) => {
            if (assetLoadedIndex === -1) return true;
            if (!beforeAssetLoaded) return true;
            return index < assetLoadedIndex;
        })
        .map((item, id) => ({
            id,
            content: item.interaction,
            start: gap + item.timestamps.start,
            duration: item.timestamps.duration
        }));
}

function sleep(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function isPushPoll(url) {
    return url.match(/action=pushPoll/);
}

function isSavedHttpUrl(store, url) {
    const includeHttpPaths = store.tables.settings.list.get()
        .filter(item => item.interaction === INTERACTIONS.HTTP_REQUEST)
        .map(item => item.match);
    return includeHttpPaths.filter(path => url.match(new RegExp(path))).length;
}

function isSavedWebSocketUrl(store, url) {
    const includeWsPaths = store.tables.settings.list.get()
        .filter(item => item.interaction === INTERACTIONS.WS_MESSAGE)
        .map(item => item.match);
    return includeWsPaths.filter(path => url.match(new RegExp(path))).length;
}

function getElementPath(element) {
    const path = [];
    let el = element;
    while (el && el !== window) {
        path.push(el);
        el = el.parentNode;
    }
    return path;
}

function objectToQueryParams(obj, filter = () => true) {
    return Object
        .keys(obj)
        .filter(filter)
        .map(key => `${key}=${obj[key]}`)
        .join('&');
}

function getCasinoLobbyServicesUrl({ params }, { environment = ENVIRONMENTS.LIVE.value } = {}) {
    const { originalGameUrl, gameUrl } = params;
    return environment === ENVIRONMENTS.LIVE.value ? originalGameUrl : gameUrl;
}

function createJiraTable(list, headers) {
    function jiraTable(str, header = false) {
        return item => {
            return Object.keys(item)
                .filter(key => str.includes(key))
                .sort((a, b) => str.indexOf(a) - str.indexOf(b))
                .map(key => item[key].toString()).join(header ? '||' : '|');
        };
    }

    const header = Object.keys(list[0])
        .reduce((red, item) => ({ [item]: item, ...red }), {});
    const headerText = [header].map(jiraTable(headers, true)).join('||\n||');
    const text = list.map(jiraTable(headers)).join('|\n|');
    return `||${headerText}||\n|${text}|`;
}

function popupOpen({ url, sessionToken }, features = 'width=800,height=600,left=-400,top=40,menubar,location,resizable,scrollbars') {
    return new Promise(resolve => {
        var popup = window.open(url, '_blank', features);
        var popupTick = setInterval(function () {
            if (popup.closed) {
                clearInterval(popupTick);
                navigator.sendBeacon(SERVER.INSPECTOR_API.GAME_CLOSE, sessionToken);
                resolve();
            }
        }, 500);
    });
}

module.exports = {
    parseStatements,
    getUrlParameter,
    createInspectorListItem,
    formatChronograph,
    stringUtils,
    arrayUtils,
    queryParamsToObject,
    getSafePostMessage,
    getReplayTimeline,
    sleep,
    isPushPoll,
    isSavedHttpUrl,
    isSavedWebSocketUrl,
    getElementPath,
    objectToQueryParams,
    createJiraTable,
    getCasinoLobbyServicesUrl,
    popupOpen
};
