const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let mainWindow;

global.data_version = {
  settings: '3.1',
  posts: '3.0',
  bot: '3.0',
  channels: '3.0',
  botavatar: '3.0',
  drafts: '3.0',
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 650,

    minWidth: 850,
    minHeight: 600,

    'title-bar-style': 'hidden',
    icon: __dirname + '/icons/chad.png',
    show: true,
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL(`file://${__dirname}/content/index.html`);

  ipcMain.once('show-window', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
