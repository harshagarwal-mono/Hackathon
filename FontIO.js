const { reduce, pipe } = require('ramda');
const { v4 } = require('uuid');

const FONT_ACTIVATION_DEACTIVATION_RESPONSE = "FontOperationStatusResponse";

class FontIO {
    constructor(fontIOclient, relay) {
        this.fontIOclient = fontIOclient;
        this.relay = relay;
    }

    async activateOrDeactivateFonts(data, activate = true) {
        const requestId = v4();

        return new Promise((resolve) => {
            const handleFontIOResponse = (response) => {
                const { RequestId, Assets } = response; 

                if (RequestId !== requestId) {
                    return;
                }

                this.relay.removeListener(FONT_ACTIVATION_DEACTIVATION_RESPONSE, handleFontIOResponse);
                const parsedAssets = FontIO.parseFontIOResponse(Assets);

                const result = pipe(
                    map(({ fontId }) => {
                        const status = parsedAssets[fontId].Status;
                        return { fontId, status };
                    }),
                    reduce((acc, { fontId, status }) => {
                        acc[fontId] = status;

                        return acc;
                    }, {})
                )(data);

                resolve(result);
            };
            this.relay.on(FONT_ACTIVATION_DEACTIVATION_RESPONSE, handleFontIOResponse);

            const method = activate ? 'requestToActivateFonts' : 'requestToDeactivateFonts';

            this.fontIOclient[method](requestId, data);
        });
    }

    static parseFontIOResponse(assets) {
        return reduce((acc, asset) => {
            const { FontId } = asset;

            acc[FontId] = asset;

            return acc;
        }, {}, assets);
    }
}

module.exports = FontIO;
