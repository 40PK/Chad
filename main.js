const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,

    minWidth: 630,
    minHeight: 600,

    maxWidth: 960,
    maxHeight: 630,

    'title-bar-style': 'hidden',
    icon: __dirname + '/icons/chad.png'
  });

  mainWindow.loadURL(`file://${__dirname}/content/index.html`);


  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
})