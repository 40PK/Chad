const {
  BrowserWindow,
  ipcMain,
  Menu,
  app,
} = require('electron');
const request = require('superagent');
const checkUpdates = require('./checkUpdates');
const menu = require('./menu');

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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('build-menu', (event, locals) => {
    Menu.setApplicationMenu(menu(locals));
  });

  ipcMain.on('check-updates', (event, locals) => {
    checkUpdates(locals);
  });
}

app.on('ready', () => {
  createWindow();
});

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
