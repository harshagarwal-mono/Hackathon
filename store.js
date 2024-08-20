const Store = require('electron-store');

class ElectronStore {
    constructor() {
        this.store = new Store({
            schema: {
                user: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                        },
                        name: {
                            type: 'string',
                        },
                        token: {
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
                            fontPsName: {
                                type: 'string',
                            },
                            fontFamilyName: {
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
