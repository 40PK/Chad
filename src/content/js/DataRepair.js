const { remote } = require('electron');

const initialVersions = {
  settings: '3.0',
  posts: '3.0',
  bot: '3.0',
  channels: '3.0',
  botavatar: '3.0',
  drafts: '3.0',
};

const defaultSettings = {
  lang: 'en',
  darkTheme: false,
  postWriteDefaults: {
    parser: 'none',
    disablePreview: false,
    disableNotification: false,
  },
};

class DataRepair {
  static repair () {
    let lastVersion = localStorage.getItem('data_version');
    if (!lastVersion) {
      lastVersion = initialVersions;
    } else {
      lastVersion = JSON.parse(lastVersion);
    }

    let currentVersion = remote.getGlobal('data_version');
    let newSettingsVer = DataRepair.processSettings(lastVersion.settings, currentVersion.settings);

    lastVersion.settings = newSettingsVer;

    localStorage.setItem('data_version', JSON.stringify(lastVersion));
  }

  static processSettings(oldVer, newVer) {
    let settings = localStorage.getItem('settings');
    if (!settings) {
      settings = defaultSettings;
      localStorage.setItem('settings', JSON.stringify(settings));
      return newVer;
    } else {
      settings = JSON.parse(settings);
    }

    if (oldVer === newVer) return newVer;

    if (oldVer === '3.0' && newVer === '3.1') {
      settings.postWriteDefaults = defaultSettings.postWriteDefaults;
    }

    localStorage.setItem('settings', JSON.stringify(settings));
    return newVer;
  }
}

module.exports = DataRepair.repair;
