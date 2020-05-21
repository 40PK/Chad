const {
  dialog,
  shell,
  app,
} = require('electron');
const request = require('superagent');
const compare = require('semver-compare');

const version = app.getVersion();

module.exports = (local, focusedWindow, notifyUpToDate) => {
  request.get('https://api.github.com/repos/40PK/Chad/releases/latest')
  .set('User-Agent', "Chad")
  .end((err, res) => {
    const newVer = res.body.tag_name.substr(1);
    const hasUpdates = compare(newVer, version) === 1;
    const answerDialog = [];
    if (focusedWindow) answerDialog.push(focusedWindow);

    if (hasUpdates) {
      answerDialog.push({
        type: 'question',
        message: local.update,
        detail: local.update_new.replace('$newVer', newVer),
        buttons: [local.update_new_detail, local.update_new_cancel],
      });
      const answer = dialog.showMessageBox.apply(null, answerDialog);
      if (answer === 0) {
        shell.openExternal(`https://github.com/40PK/Chad/releases/tag/v${newVer}`);
      }
    } else if (notifyUpToDate) {
      answerDialog.push({
        type: 'info',
        message: local.update_no,
        detail: local.update_no_text.replace('$version', version),
        buttons: [local.update_no_ok],
      });
      dialog.showMessageBox.apply(null, answerDialog);
    }
  });
};
