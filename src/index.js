const {
  BrowserWindow,
  ipcMain,
  Menu,
  app,
} = require('electron');
const checkUpdates = require('./checkUpdates');
const menu = require('./menu');
const path = require('path');

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
    icon: path.join(__dirname, '/icons/chad.png'),
    show: true,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    }
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile('app/index.html');

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

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
 if (BrowserWindow.getAllWindows().length === 0) {
   createWindow()
 }
})