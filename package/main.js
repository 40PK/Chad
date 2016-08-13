const electron = require("electron");

const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

const ipcMain = electron.ipcMain;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 650,
    minWidth: 850,
    minHeight: 600,
    "title-bar-style": "hidden",
    icon: __dirname + "/icons/chad.png",
    show: true
  });
  mainWindow.loadURL(`file://${__dirname}/content/index.html`);
  ipcMain.once("show-window", (() => {
    mainWindow.show();
  }));
  mainWindow.on("closed", (() => {
    mainWindow = null;
  }));
}

app.on("ready", createWindow);

app.on("window-all-closed", (() => {
  if (process.platform !== "darwin") {
    app.quit();
  }
}));

app.on("activate", (() => {
  if (mainWindow === null) {
    createWindow();
  }
}));