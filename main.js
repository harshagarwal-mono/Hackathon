const { app } = require('electron')
const Aplication = require('./App/index.js');

const application = new Aplication();

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

const main = async () => {
  await application.init();

  app.whenReady().then(application.onReady.bind(application));
};

main();
