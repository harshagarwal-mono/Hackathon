const path = require('path');
const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const trayProtoPath = path.join(__dirname, '..', 'protos', 'Tray.proto');
const packageDefinition = protoLoader.loadSync(trayProtoPath);
const trayProto = grpc.loadPackageDefinition(packageDefinition);

function Ping(relay, call, cb) {
    return cb(null, { });
}

function FireAndForget(relay, call, cb) {
    const { request, } = call;
    const { type, data, } = request;

    console.log('Received Message on Grpc Server: ', type);

    try {
        const parsedData = isNilOrEmpty(data) ? {} : JSON.parse(data);
        relay.emit(type, parsedData);
    } catch (error) {
        console.error('Error in parsing data: ', error);

        return cb(null, {});
    }

    return cb(null, {});
}

/**
 * GrpcServer class
 */
class GrpcServer {
    /**
     * constructor
     * @param {EventEmitter} relay - relay instance
     * @param {Object} serverOptions - server options
     * @returns {undefined} - no return value
     */
    constructor(relay, serverOptions) {
        this.relay = relay;
        this.serverOptions = serverOptions;
        this.server = new grpc.Server();

        this.server.addService(trayProto.PingPong.service, {
            Ping: Ping.bind(null, this.relay),
        });
        this.server.addService(trayProto.FireAndForget.service, {
            FireAndForget: FireAndForget.bind(null, this.relay),
        });
    }

    /**
     * start the server
     * @returns {Promise} - promise which resolved when server started
     */
    startAsync() {
        this.initServer();

        return new Promise((resolve, reject) => {
            this.server.bindAsync(`unix:${this.serverOptions.ServerEndPoint}`, grpc.ServerCredentials.createInsecure(), (err) => {
                if (err) {
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    /**
     * destroy the server
     * @returns {undefined} - no return value
     */
    destroy() {
        this.server.forceShutdown();
        this.server = null;
        this.relay = null;
        this.serverOptions = null;
        this.accessTokenManeger = null;
    }

    /**
     * initialization steps before starting the server
     * @returns {undefined}
     */
    initServer() {
        if (process.platform === 'darwin') {
            const dirName = path.dirname(this.serverOptions.ServerEndPoint);

            if (fs.existsSync(dirName)) {
                fs.rmSync(dirName, { recursive: true, });
            }

            fs.mkdirSync(dirName, { recursive: true, });
        }
    }
}

module.exports = GrpcServer;
