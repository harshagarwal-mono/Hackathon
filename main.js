const { app } = require('electron')
const remoteMain = require('@electron/remote/main');
const Aplication = require('./App/index.js');

const application = new Aplication();

remoteMain.initialize();

app.on('window-all-closed', function () {
  app.quit();
})

const main = async () => {
  await application.init();

  app.whenReady().then(application.onReady.bind(application));
};

main();
