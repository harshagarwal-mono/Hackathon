const { reduce, pipe, map } = require('ramda');
const { v4 } = require('uuid');

const FONT_ACTIVATION_DEACTIVATION_RESPONSE = "FontOperationStatusResponse";
const DEACTIVATE_ALL_MONOTYPEFONTS_STATUS_RESPONSE = "DeactivateAllMonotypeFontStatusResponse";

class FontIO {
    constructor(fontIOclient, relay) {
        this.fontIOclient = fontIOclient;
        this.relay = relay;
    }

    async activateOrDeactivateFonts(data, activate = true) {
        const requestId = v4();

        return new Promise(async (resolve) => {
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

            const requestSent = await this.fontIOclient[method](requestId, data);

            if (!requestSent) {
                resolve({});
            }
        });
    }

    async deactivateAllFonts() {
        return new Promise(async (resolve) => {
            const handleFontIOResponse = (response) => {
                resolve(true);
            };

            this.relay.on(DEACTIVATE_ALL_MONOTYPEFONTS_STATUS_RESPONSE, handleFontIOResponse);

            const requestSent = await this.fontIOclient.requestDeactivateAllFonts();

            if (!requestSent) {
                resolve(false);
            }
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
