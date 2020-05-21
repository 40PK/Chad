const electron = require('electron');

window.ipcRenderer = electron.ipcRenderer;
window.shell = electron.shell;
window.remote = electron.remote;
