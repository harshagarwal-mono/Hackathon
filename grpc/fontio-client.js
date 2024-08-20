const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'protos', 'FontIO.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const fontIOProto = grpc.loadPackageDefinition(packageDefinition);

const grpcCallTimeout = 10000;
const ACTIVATE_FONTS = "ActivateFonts";
const DEACTIVATE_FONTS = "DeactivateFonts";
const REQUEST_DEACTIVATE_ALL_MONOTYPE_FONTS = "RequestDeactivateAllMonotypeFonts";


/**
 * HlsClient class
 */
class FontIOClient {
    /**
     * constructor
     * @param {object} opts - client options
     * @returns {FontIOClient} - instance of HlsClient
     */
    constructor(opts) {
        this.connectionEndPoint = `unix:${opts.ConnectionEndPoint}`;
    }

    /**
     * send request to fontio to activate fonts
     * @param {String} requestId
     * @param {Array<Object>} data 
     */
    requestToActivateFonts(requestId, data) {
        const preparedData = data.map(({ fontId, fontDownloadPath, context = '' }) => {
            return {
                FontId: fontId,
                FontPath: fontDownloadPath,
                Context: context,
            };
        });
        const messageData = {
            RequestId: requestId,
            Assets: preparedData,
        };

        return this.fireAndForgetRequest(ACTIVATE_FONTS, messageData);
    }
    
    /**
     * send request to fontio to deactivate fonts
     * @param {String} requestId
     * @param {Arra<Object>} data 
     * @returns 
     */
    requestToDeactivateFonts(requestId, data) {
        const preparedData = data.map(({ fontId, fontDownloadPath, context = '' }) => {
            return {
                FontId: fontId,
                FontPath: fontDownloadPath,
                Context: context,
            };
        });
        const messageData = {
            RequestId: requestId,
            Assets: preparedData,
        };

        return this.fireAndForgetRequest(DEACTIVATE_FONTS, messageData);
    }

    requestDeactivateAllFonts() {
        return this.fireAndForgetRequest(REQUEST_DEACTIVATE_ALL_MONOTYPE_FONTS);
    }

    /**
     * return client for fire and forget service
     * @private - private member
     * @returns {Object} - client object
     */
    getFireAndForgetClient() {
        return new fontIOProto.FireAndForget(
            this.connectionEndPoint,
            grpc.credentials.createInsecure()
        );
    }


    /**
     * fire and forget request to hls
     * @private - private member
     * @param {String} type - event to be emitted
     * @param {Object} data - data to be sent
     * @returns {Promise} - which resolves with value true when request is sent to hls and false if not sent
     */
    fireAndForgetRequest(type, data = {}) {
        return new Promise((resolve) => {
            const message = {
                type,
                data: JSON.stringify(data),
            };
            const deadline = new Date(Date.now() + grpcCallTimeout);
            this.getFireAndForgetClient().FireAndForget(message, { deadline, }, (error) => {
                if (error) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    /**
     * clean up
     * @returns {undefined} - no return value
     */
    destroy() {
        this.connectionEndPoint = null;
        this.clientPlugin = null;
    }
}

module.exports = FontIOClient;
