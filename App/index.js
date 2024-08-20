const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");
const remoteMain = require("@electron/remote/main");
const { userInfo } = require("os");
const GrpcServer = require("../grpc/server.js");
const FontIOClient = require("../grpc/fontio-client.js");
const FontIO = require("../FontIO");
const Relay = require("../Relay.js");
const Store = require("../store.js");
const {
  AUTHENTICATION_STATES,
  ASSETS_STATES,
} = require("../constants/index.js");
const {
  getUserData,
  getAssetsMetaData,
  downloadFiles,
  unzipFile,
  getDownloadPathForFont,
} = require("../helper.js");
const { isEmptyOrNil } = require("../utils/index.js");
const { getFontIOPath } = require("../pathHelper/index.js");
const ProcessWatcher = require("../ProcessWatcher.js");

const appDataPath = app.getPath("appData");
const userDataPath = app.getPath("userData");
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
    this.assets = [];
    this.zipDownloadPath = path.join(userDataPath, "downloads");
    this.fontsPath = path.join(appDataPath, "Monotype Fonts", ".fonts");
    this.fontIOPath = getFontIOPath();
    this.fontIOWatcher = new ProcessWatcher(this.relay, this.fontIOPath, "FontIO");

    this.serverEndPoint = connectionInputGrcpServer[process.platform].endPoint;
    this.connectionEndPoint =
      connectionInputFontIOClient[process.platform].endPoint;
  }

  async init() {
    this.setUpGlobal();
    this.setUpStoreData();
    this.setUpListeners();
    await this.setUpGrpcServer();
    this.setUpFontIOClient();
    this.setUpFontIO();
  }

  async onReady() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 1000,
      height: 1200,
      webPreferences: {
        partition: "persist:HACKATHON-APP_DEFAULT",
        preload: path.join(__dirname, "preload.bundle.js"),
        contextIsolation: false,
        nodeIntegration: false,
        enableRemoteModule: true,
        sandbox: false,
      },
      title: "FontFriend",
    });
    remoteMain.enable(mainWindow.webContents);

    await mainWindow.loadURL("https://enterprise-preprod.monotype.com/dtapppwa/0.0.0/index.html");
  }

  setUpGlobal() {
    global.MAS_APP = {};
    global.MAS_APP.relay = this.relay;
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

  setUpListeners() {
    this.relay.on(
      "checkAuthenticationState",
      this.checkAuthenticationState.bind(this)
    );
    this.relay.on("login", this.hanldeLoginRequest.bind(this));
    this.relay.on("logout", this.handleLogoutRequest.bind(this));
  }

  checkAuthenticationState() {
    console.log("Checking Authentication State");
    this.sendLoginData();
  }

  sendLoginData(data = {}) {
    this.relay.emit("loginResponse", {
      state: this.authenticationState,
      data: {
        ...data,
        user: this.userData,
        assets: this.assets,
      },
    });
  }

  async hanldeLoginRequest({ token }) {
    if (this.authenticationState === AUTHENTICATION_STATES.AUTHENTICATED) {
      console.log("Already authenticated");
      return;
    }
    if (this.authenticationState === AUTHENTICATION_STATES.AUTHENTICATING) {
      console.log("Already authenticating");
      return;
    }
    this.login(token);
  }

  async handleLogoutRequest() {
    if (this.authenticationState === AUTHENTICATION_STATES.UNAUTHENTICATED) {
      console.log("Already unauthenticated");
      return;
    }
    if (this.authenticationState === AUTHENTICATION_STATES.UNAUTHENTICATING) {
      console.log("Already unauthenticating");
      return;
    }
    this.logout();
  }

  async login(token) {
    try {
      console.log("Logging in");
      await this.startFontIO();
      await this.changeAuthenticationState(
        AUTHENTICATION_STATES.AUTHENTICATING
      );

      // get user data
      const userData = await getUserData(token);
      const assetsWithoutStatus = await getAssetsMetaData(token);

      let assets = assetsWithoutStatus.map((asset) => ({
        ...asset,
        fontDownloadPath: "",
        status: ASSETS_STATES.DOWNLOADING,
      }));

      assets = await this.downloadFonts(token, assets);

      const res = await this.fontIO.activateOrDeactivateFonts(assets);

      console.log("Assets Processed From FontIO", res);

      assets = assets.map((asset) => ({
        ...asset,
        status: res[asset.fontId]
          ? ASSETS_STATES.ACTIVATED
          : ASSETS_STATES.INSTALL_FAILED,
      }));

      await this.changeAuthenticationState(AUTHENTICATION_STATES.AUTHENTICATED);
      await this.setData({
        userData,
        assets,
      });
      console.log("Login Completed");
      this.sendLoginData();
    } catch (error) {
      console.error("Error while logging in", error);
      await this.changeAuthenticationState(
        AUTHENTICATION_STATES.UNAUTHENTICATED
      );
      this.sendLoginData({
        errorMesssage: error.message,
      });
    }
  }

  async logout() {
    try {
      console.log("Logging out");
      await this.changeAuthenticationState(
        AUTHENTICATION_STATES.UNAUTHENTICATING
      );
      this.cleanUpAndPrepareFontsPath(this.userData.token);
      console.log("Fonts Path cleaned up");
      await this.fontIO.deactivateAllFonts();
      console.log("All Fonts Deactivated");
      await this.fontIOWatcher.stop();
      console.log("FontIO Watcher Stopped");
      await this.changeAuthenticationState(
        AUTHENTICATION_STATES.UNAUTHENTICATED
      );
      this.setData({
        userData: {},
        assets: [],
      });
      this.sendLoginData();
    } catch (error) {
      console.error("Error while logging out", error);
      await this.changeAuthenticationState(AUTHENTICATION_STATES.AUTHENTICATED);
      this.sendLoginData({
        errorMesssage: error.message,
      });
    }
  }

  async startFontIO() {
    return new Promise(async (resolve) => {
      const handleFontIOInit = () => {
        this.relay.removeListener("FetchInstalledFontCanStartResponse", handleFontIOInit);
        resolve(true);
      }
      this.relay.on('FetchInstalledFontCanStartResponse', handleFontIOInit);
      this.fontIOWatcher.start();
    });
  }

  setUpStoreData() {
    this.userData = this.store.get("user");
    this.assets = this.store.get("assets");
    this.authenticationState = isEmptyOrNil(this.userData)
      ? AUTHENTICATION_STATES.UNAUTHENTICATED
      : AUTHENTICATION_STATES.AUTHENTICATED;
  }

  async setData({ userData, assets }) {
    this.userData = userData;
    this.assets = assets;
    await this.store.set("user", userData);
    await this.store.set("assets", assets);
  }

  async changeAuthenticationState(state) {
    this.authenticationState = state;
  }

  cleanUpAndPrepareFontsPath(token) {
    const zipPath = path.join(this.zipDownloadPath, `${token}.zip`);
    const fontsPath = this.fontsPath;

    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    if (fs.existsSync(fontsPath)) {
      fs.rmSync(fontsPath, { recursive: true });
    }

    return {
      zipPath,
      fontsPath,
    };
  }

  async downloadFonts(token, assets) {
    const { zipPath, fontsPath } = this.cleanUpAndPrepareFontsPath(token);
    console.log("Fonts Path cleaned up Before Downloading Again");

    await downloadFiles(token, zipPath);
    console.log("Zip file downloaded");
    await unzipFile(zipPath, fontsPath);
    console.log("Zip file unzipped");

    return assets.map((asset) => ({
      ...asset,
      fontDownloadPath: getDownloadPathForFont(fontsPath, asset.fontMd5),
    }));
  }
}

module.exports = App;
