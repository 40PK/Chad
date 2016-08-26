const checkUpdates = require('./checkUpdates');
const {
  shell,
  Menu,
  remote,
  app,
} = require('electron');

module.exports = local => {
  const template = [
    {
      label: local.tmenu_edit,
      submenu: [
        {
          role: 'undo',
          label: local.tmenu_edit_undo,
        },
        {
          role: 'redo',
          label: local.tmenu_edit_redo,
        },
        {
          type: 'separator',
        },
        {
          role: 'cut',
          label: local.tmenu_edit_cut,
        },
        {
          role: 'copy',
          label: local.tmenu_edit_copy,
        },
        {
          role: 'paste',
          label: local.tmenu_edit_paste,
        },
        {
          role: 'delete',
          label: local.tmenu_edit_delete,
        },
        {
          role: 'selectall',
          label: local.tmenu_edit_selectall,
        },
      ],
    },
    {
      label: local.tmenu_view,
      submenu: [
        {
          label: local.tmenu_view_reload,
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload();
          },
        },
        {
          label: local.tmenu_view_toggledevtools,
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          },
        },
        {
          type: 'separator',
        },
        {
          role: 'resetzoom',
          label: local.tmenu_view_resetzoom,
        },
        {
          role: 'zoomin',
          label: local.tmenu_view_zoomin,
        },
        {
          role: 'zoomout',
          label: local.tmenu_view_zoomout,
        },
        {
          type: 'separator',
        },
        {
          role: 'togglefullscreen',
          label: local.tmenu_view_togglefullscreen,
        },
      ],
    },
    {
      role: 'window',
      label: local.tmenu_window,
      submenu: [
        {
          role: 'minimize',
          label: local.tmenu_window_minimize,
        },
        {
          role: 'close',
          label: local.tmenu_window_close,
        },
      ],
    },
    {
      role: 'help',
      label: local.tmenu_help,
      submenu: [
        {
          label: local.tmenu_help_learnmore,
          click() { shell.openExternal('https://perkovec.github.io/Chad'); },
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          label: local.tmenu_app_about,
          role: 'about',
        },
        {
          label: local.tmenu_app_checkforupdates,
          click(item, focusedWindow) {
            if (focusedWindow) checkUpdates(local, focusedWindow, true);
          },
        },
        {
          label: local.tmenu_app_reportbugs,
          click() {
            shell.openExternal('http://github.com/40PK/Chad/issues');
          },
        },
        {
          type: 'separator',
        },
        {
          role: 'services',
          label: local.tmenu_app_services,
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          role: 'hide',
          label: local.tmenu_app_hide,
        },
        {
          role: 'hideothers',
          label: local.tmenu_app_hideothers,
        },
        {
          role: 'unhide',
          label: local.tmenu_app_unhide,
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
          label: local.tmenu_app_quit,
        },
      ],
    });

    // Window menu.
    template[3].submenu = [
      {
        label: local.tmenu_window_close,
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
      {
        label: local.tmenu_window_minimize,
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: local.tmenu_window_zoom,
        role: 'zoom',
      },
      {
        type: 'separator',
      },
      {
        label: local.tmenu_window_front,
        role: 'front',
      },
    ];
  } else {
    template[template.length - 1].submenu.unshift({
      label: local.tmenu_app_reportbugs,
      click() {
        shell.openExternal('http://github.com/40PK/Chad/issues');
      },
    });
    template[template.length - 1].submenu.unshift({
      label: local.tmenu_app_checkforupdates,
      click(item, focusedWindow) {
        if (focusedWindow) checkUpdates(focusedWindow, true);
      },
    });
  }

  return Menu.buildFromTemplate(template);
};

