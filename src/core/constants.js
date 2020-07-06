const VERSION = process.env.PRODUCT_VERSION;
const DEPLOY_PATHNAME = process.env.DEPLOY_PATHNAME;
const SERVER_ROOT = '/inspector';
const SERVER_PORT = 8443;
const SERVER_HOST = '10.102.34.92';

const SERVER = {
    HOST: SERVER_HOST,
    PORT: SERVER_PORT,
    DEPLOY_PATHNAME,
    HTTP_ORIGIN: `https://${SERVER_HOST}:${SERVER_PORT}`,
    WSS_ORIGIN: `wss://${SERVER_HOST}:${SERVER_PORT}`,
    ROOT: SERVER_ROOT,
    VIEW_SCREEN_SHOOT: `${SERVER_ROOT}/screen-shoots`,
    INSPECTOR_API: {
        TAKE_SCREEN_SHOOT: `${SERVER_ROOT}/api/take-screen-shoot`,
        SAVE_INTERACTIONS: `${SERVER_ROOT}/api/save`,
        RELOAD: `${SERVER_ROOT}/api/reload`,
        RECORDING_DOWNLOAD: `${SERVER_ROOT}/api/recording`,
        RECORDING_VIEW: `${SERVER_ROOT}/api/recording/viewer`,
        INSERT_BUG: `${SERVER_ROOT}/api/bug`,
        INSERT_TEST: `${SERVER_ROOT}/api/test`,
        TEST_VIEW: `${SERVER_ROOT}/api/test/view`,
        TEST_RUN: `${SERVER_ROOT}/api/test/run`,
        GAME_LAUNCH: `${SERVER_ROOT}/api/game-launch`,
        GAME_CLOSE: `${SERVER_ROOT}/api/game-close`,
        STATISTICS: `${SERVER_ROOT}/api/statistics`
    }
};

const INSPECTOR = {
    SCREEN_SHOOTS_DIR: 'screen-shoots/',
    SAVE_DIR: 'recordings/',
    I_FRAME_SRC: '/inspect-iframe/index.html',
    TRANSPORTER: {
        ID: 'inspector-transporter'
    }
};

const GAME_LAUNCHER = {
    PRIVATE_DIR: '../private/'
};

const ENVIRONMENTS = {
    LIVE: { value: 'production', label: 'PRODUCTION', path: '' }
};

const DEFAULT_PARAMS = {
    environment: ENVIRONMENTS.LIVE.value,
    port: SERVER.PORT,
    additionalQueryParams: {}
};

const INSPECTOR_LOCAL_STORAGE_PREFIX = 'inspector.';
const EXPLORER_LOCAL_STORAGE_PREFIX = 'reporter.';
const DESIGNS = {
    LANDSCAPE: 'landscape',
    PORTRAIT: 'portrait',
    DESKTOP: 'desktop'
};
const BTN_STATES = {
    CHECKED: 'checked',
    UNCHECKED: 'unchecked',
    DISABLED: 'disabled',
    COLLAPSED: 'collapsed'
};
const MODES = {
    PLAY: 'play',
    RECORD: 'stop'
};
const INTERACTIONS = {
    WEBTREKK_EVENT: 'webtrekk-event',
    APM_EVENT: 'apm-event',
    LOCAL_STORAGE_INIT: 'local-storage-init',
    ASSETS_LOADED: 'assets-loaded',
    HTTP_REQUEST: 'http-request',
    WS_MESSAGE: 'web-socket-message',
    POINTER: 'pointer',
    RELOAD: 'reload',
    SCREEN_SHOOT: 'screen-shoot',
    MARKER: 'marker',
    WINDOW_RESIZE: 'window-resize',
    DEVICE_SETUP_INIT: 'device-setup-init',
    LOGGER: 'logger',
    SEND_CONTEXT: 'context'
};

const KEYBOARD_EVENTS = {
    STOP_RECORDING: 0,
    SCREEN_SHOOT: 1,
    MARKER: 2
};

const VIG_GAMES = {
    BLACKJACK_CLASSIC: { gameId: 522, defaultTableId: 'X31', gameType: 'bjc' },
    BLACKJACK_EARLY_PAYOUT: { gameId: 521, defaultTableId: 'J1', gameType: 'bjep' },
    AMERICAN_ROULETTE: { gameId: 520, defaultTableId: 'S1', gameType: 'americanroulette' },
    EUROPEAN_ROULETTE: { gameId: 519, defaultTableId: 'R1', gameType: 'roulette' }
};

const COOKIES = {
    GAME_SESSION: 'sessionToken'
};

const VIG_TABLES = {
    X31: {},
    X32: {},
    X33: {},
    X34: {},
    X35: {},
    X36: {},
    X37: {},
    X38: {},
    J1: {
        selector: '.game.blackjackep a span.box.ng-binding'
    },
    J2: {
        selector: '.game.blackjackep a span.box.ng-binding'
    },
    J3: {
        selector: '.game.blackjackep a span.box.ng-binding'
    },
    S1: {
        selector: '.game.roulette a span.box.ng-binding'
    },
    R1: {
        selector: '.game.roulette a span.box.ng-binding'
    }
};

const EXPLORER = {
    WINDOW_HEIGHT_MARGIN: 30
};

const SESSION = {
    TYPES: {
        PLAY: 'play',
        REPLAY: 'replay',
        BUG: 'bug',
        TEST_SETUP: 'test-setup',
        TEST_RUN: 'test-run'
    },
    ORIGIN: {
        DEVELOPMENT: 'development',
        MOBILE: 'mobile',
        JIRA: 'jira',
        REPORTER_CUT: 'reporter-cut',
        REPORTER_COPY: 'reporter-copy-link',
        REPORTER_BROWSER: 'reporter-browser',
        REPORTER_FRAME: 'reporter-frame',
        SERVER: 'server',
        EXTERNAL: 'external'
    }
};

const TESTS = {
    STATUS: {
        SETUP: 'setup',
        RUNNING: 'running',
        PASSED: 'passed',
        FAILED: 'failed'
    }
};

const LANGUAGES = {
    EN: { value: 'en', label: 'English' },
    ES: { value: 'es', label: 'Spanish' },
    ID: { value: 'id', label: 'Indonesian' },
    JA: { value: 'ja', label: 'Japanese' },
    PT: { value: 'pt', label: 'Portuguese' },
    TH: { value: 'th', label: 'Thailandes' },
    VI: { value: 'vi', label: 'Vietnamese' },
    ZH: { value: 'zh', label: 'Chinese' }
};

const CURRENCIES = {
    XSC: {
        label: 'Slots Coins',
        value: 'XSC',
        symbol: 'SC'
    },
    VND: {
        label: 'Vietnamese Dong',
        value: 'VND',
        symbol: '₫'
    },
    USD: {
        label: 'US Dollar',
        value: 'USD',
        symbol: '$'
    },
    THB: {
        label: 'Thai Baht',
        value: 'THB',
        symbol: '฿'
    },
    PEN: {
        label: 'Peruvian Sol',
        value: 'PEN',
        symbol: 'S/'
    },
    MYR: {
        label: 'Malaysian Ringgit',
        value: 'MYR',
        symbol: 'RM'
    },
    MXN: {
        label: 'Mexican Peso',
        value: 'MXN',
        symbol: '$'
    },
    JPY: {
        label: 'Japanese Yen',
        value: 'JPY',
        symbol: '¥'
    },
    IDR: {
        label: 'Indonesian Ruppe',
        value: 'IDR',
        symbol: 'Rp'
    },
    CNY: {
        label: 'Chinese Yuan',
        value: 'CNY',
        symbol: '¥'
    },
    CAD: {
        label: 'CA Dollar',
        value: 'CAD',
        symbol: '$'
    },
    BRL: {
        label: 'Brazilian Real',
        value: 'BRL',
        symbol: 'R$'
    },
    BOB: {
        label: 'Bolivian Boliviano',
        value: 'BOB',
        symbol: '$b'
    },
    AUD: {
        label: 'Australian Dollar',
        value: 'AUD',
        symbol: '$'
    },
    ARS: {
        label: 'Argentine Peso',
        value: 'ARS',
        symbol: '$'
    }
};

const APPS = [
    { value: 'users' },
    { value: 'games' },
    { value: 'devices' },
    { value: 'combos' },
    { value: 'recordings' },
    { value: 'tests' },
    { value: 'bugs' },
    { value: 'sessions' },
    { value: 'plugins' },
    { value: 'statistics' }
];

const PLUGINS = {
    NETWORK: { label: 'Network', value: 'network' }
};

const WIZARD = {
    TYPES: {
        CONFIRM: 'confirm',
        NUMBER: 'number',
        TEXT: 'text',
        DATE: 'date',
        PASSWORD: 'password',
        TEXT_AREA: 'textarea',
        SELECT: 'select',
        MULTI_CHECK: 'multi-check'
    }
};

const MATCH_QUERY_STRING_PARAMS = ['gameCode', 'machId', 'gameId', 'hands', 'theme'];

function objectToArray(obj) {
    return Object.keys(obj).map(key => obj[key]);
}

function constantToArray(obj) {
    return Object.keys(obj).reduce((acc, key) => acc.concat({ value: obj[key], label: key.replace('_', ' ') }), []);
}

function getEnvironmentByValue(value) {
    return objectToArray(ENVIRONMENTS).find(item => item.value === value.toString());
}

function getVigGameConfig(gameId) {
    const gameKey = Object.keys(VIG_GAMES).find(key => VIG_GAMES[key].gameId === gameId) || '';
    return VIG_GAMES[gameKey];
}

module.exports = {
    INSPECTOR,
    DEFAULT_PARAMS,
    INSPECTOR_LOCAL_STORAGE_PREFIX,
    EXPLORER_LOCAL_STORAGE_PREFIX,
    DESIGNS,
    BTN_STATES,
    MODES,
    INTERACTIONS,
    GAME_LAUNCHER,
    KEYBOARD_EVENTS,
    VIG_GAMES,
    SERVER,
    COOKIES,
    VIG_TABLES,
    ENVIRONMENTS,
    EXPLORER,
    SESSION,
    CURRENCIES,
    LANGUAGES,
    APPS,
    PLUGINS,
    WIZARD,
    TESTS,
    MATCH_QUERY_STRING_PARAMS,
    VERSION,
    getVigGameConfig,
    getBrandById,
    getEnvironmentByValue,
    objectToArray,
    constantToArray
};
