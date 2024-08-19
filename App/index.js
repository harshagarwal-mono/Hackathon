const { app, ipcMain, BrowserWindow } = require("electron");
const path = require('path');
const { userInfo } = require("os");
const GrpcServer = require("../grpc/server.js");
const FontIOClient = require("../grpc/fontio-client.js");
const FontIO = require("../FontIO");
const Relay = require("../Relay.js");
const Store = require("../store.js");

const appDataPath = app.getPath("appData");
const CURRENTUSER = userInfo().username;
const USER_SOCKETS_DIR = `${appDataPath}/Monotype Fonts/.sockets`;

const connectionInputFontIOClient = {
  win32: {
    endPoint: `\\\\.\\pipe\\${CURRENTUSER}-FONTIO-41de7be0`,
  },
  darwin: {
    endPoint: `${USER_SOCKETS_DIR}/FontIO/41de7be0`,
  },
};

const connectionInputGrcpServer = {
  win32: {
    endPoint: `\\\\.\\pipe\\${CURRENTUSER}-Hls-41de7be0`,
  },
  darwin: {
    endPoint: `${USER_SOCKETS_DIR}/Hls/41de7be0`,
  },
};

class App {
  constructor() {
    this.grpcServer = null;
    this.fontIOClient = null;
    this.fontIO = null;
    this.authenticationState = null;
    this.relay = new Relay();
    this.store = new Store();
    this.userData = null;
    

    this.serverEndPoint = connectionInputGrcpServer[process.platform].endPoint;
    this.connectionEndPoint =
      connectionInputFontIOClient[process.platform].endPoint;
  }

  async init() {
    this.setUpAuthenticationData();
    await this.setUpGrpcServer();
    this.setUpFontIOClient();
    this.setUpFontIO();
  }

  onReady() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "..", "preload.js"),
      },
    });

    // and load the index.html of the app.
    mainWindow.loadFile("ui/index.html");
  }

  async setUpGrpcServer() {
    this.grpcServer = new GrpcServer(this.relay, {
      ServerEndPoint: this.serverEndPoint,
    });
    await this.grpcServer.startAsync();
  }

  setUpFontIOClient() {
    this.fontIOClient = new FontIOClient({
      ConnectionEndPoint: this.connectionEndPoint,
    });
  }

  setUpFontIO() {
    this.fontIO = new FontIO(this.fontIOClient, this.relay);
  }

  setUPIPcMainListeners() {
    ipcMain.handle("check-authentication-state", () => {
      return this.authenticationState;
    });
  }

  setUpAuthenticationData() {
    this.authenticationState = this.store.get("authenticationState");
    this.userData = this.store.get("user");
  }

  downloadAndInstallFonts(token) {}
}

module.exports = App;
