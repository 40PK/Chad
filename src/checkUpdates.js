const {
  dialog,
  shell,
  app,
} = require('electron');
const request = require('superagent');
const compare = require('semver-compare');

const version = app.getVersion();

module.exports = focusedWindow => {
  request.get('https://api.github.com/repos/Perkovec/Chad/releases/latest').end((err, res) => {
    const newVer = res.body.tag_name.substr(1);
    const hasUpdates = compare(newVer, version) === 1;
    let answerDialog = [];
    if (focusedWindow) answerDialog.push(focusedWindow);

    if (hasUpdates) {
      answerDialog.push({
        type: 'question',
        message: 'Update',
        detail: `A newer version ${newVer} is available!`,
        buttons: ['Detail', 'Cancel'],
      });
      const answer = dialog.showMessageBox.apply(null, answerDialog);
      if (answer === 0) {
        shell.openExternal(`https://github.com/Perkovec/Chad/releases/tag/v${newVer}`);
      }
    } else {
      answerDialog.push({
        type: 'info',
        message: 'No Updates',
        detail: `Current version ${version} is already up to date!`,
        buttons: ['OK'],
      });
      dialog.showMessageBox.apply(null, answerDialog);
    }
  });
};
