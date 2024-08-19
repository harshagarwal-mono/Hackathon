const Store = require('electron-store');
const { AUTHENTICATION_STATES } = require('./constants/index');

class ElectronStore {
    constructor() {
        this.store = new Store({
            schema: {
                authenticationState: {
                    type: 'string',
                    default: AUTHENTICATION_STATES.UNAUTHENTICATED,
                },
                user: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                    },
                },
                assets: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            fontId: {
                                type: 'string',
                            },
                            status: {
                                type: 'string',
                            },
                            fontName: {
                                type: 'string',
                            },
                            fontMd5: {
                                type: 'string',
                            },
                        },
                    },
                    default: [],
                },
            },
        });
    }
    
    get(key) {
        return this.store.get(key);
    }
    
    set(key, value) {
        this.store.set(key, value);
    }
}

module.exports = ElectronStore;
