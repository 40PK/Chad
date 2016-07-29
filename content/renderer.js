const electron = require('electron');
const context = require('electron-contextmenu-middleware');
const inputMenu = require('electron-input-menu');
const parser = require('./js/parser');
const tgAPI = require('./js/API');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;

let Chad = angular.module('Chad', []);

const usernameRegex = /@.{5,}/;
const tokenRegex = /\d{9}:.{30,}/;

const baseUrl = 'https://api.telegram.org/bot';
const filebaseUrl = 'https://api.telegram.org/file/bot';

inputMenu.registerShortcuts();
context.use(inputMenu);
context.activate();

Chad.controller('AppController', function AppController($scope, $http) {
  $scope.channels = JSON.parse(localStorage.getItem('channels') || '[]');
  $scope.adminbot = JSON.parse(localStorage.getItem('bot') || '{}');
  $scope.botavatar = localStorage.getItem('botavatar') || './assets/botavatar.png';
  $scope.token = $scope.adminbot.token || null;
  $scope.selected = {};
  $scope.multiple = false;
  $scope.parser = null;
  $scope.channelSelected = false;
  $scope.sending = false;

  let API = $scope.token !== null ? new tgAPI($scope.token) : null;

  if ($scope.token !== null) {
    $scope.changeBotToken = $scope.token;
  }

  $scope.$watchCollection('selected', (newVal, oldVal) => {
    let channelSelected = false;

    for (let i in $scope.channels) {
      if ($scope.selected[$scope.channels[i].uid]) {
        channelSelected = true;
        break;
      }
    }
    $scope.channelSelected = channelSelected;
  }, true);

  function OpenChannelDialog() {
    $('#overlay').show();
    $('#addChannelDialog').slideDown();
  }

  function CloseChannelDialog() {
    $('#overlay').hide();
    $('#addChannelDialog').slideUp();
  }

  function OpenBotDialog() {
    $('#overlay').show();
    $('#setBotDialog').slideDown();
  }

  function CloseBotDialog() {
    $('#overlay').hide();
    $('#setBotDialog').slideUp();
  }

  function OpenChangeBotDialog() {
    $('#overlay').show();
    $('#changeBotDialog').slideDown();
  }

  function CloseChangeBotDialog() {
    $('#overlay').hide();
    $('#changeBotDialog').slideUp();
  }

  function OpenInsertLinkDialog() {
    $('#overlay').show();
    $('#insertLinkDialog').slideDown();
  }

  function CloseInsertLinkDialog() {
    $('#overlay').hide();
    $('#insertLinkDialog').slideUp();
  }

  function SaveChannel() {
    if (!$scope.inputChannelName || $scope.inputChannelName.length === 0) {
      alert('Channel name is too short');
      return;
    } 
    
    if (!$scope.inputChannelName || !usernameRegex.test($scope.inputChannelUsername)) {
      alert('Invalid channel username');
      return;
    }

    $scope.channels.push({
      name: $scope.inputChannelName,
      username: $scope.inputChannelUsername,
      uid: uid()
    });
    localStorage.setItem('channels', JSON.stringify($scope.channels));

    $scope.inputChannelName = null;
    $scope.inputChannelUsername = null;

    CloseChannelDialog();
  }

  function UpdateBotProfilePhoto() {
    API.getUserProfilePhotos({
      user_id: $scope.adminbot.id,
      limit: 1
    }).then((photos) => {
      if (photos.ok && photos.result.photos.length > 0) {
        let photo = photos.result.photos[0];

        API.getFile({
          file_id: photo[photo.length-1].file_id
        }).then((getFile) => {
          if (getFile.ok) {
            API.getBlobFile(getFile.result.file_path).then((getBlob) => {
              if (getBlob) {
                var reader = new FileReader();
                reader.onloadend = function() {
                  localStorage.setItem('botavatar', reader.result);
                  $scope.botavatar = reader.result;
                  $scope.$apply();
                }
                reader.readAsDataURL(getBlob);
              }
            });
          }
        });
      } else if (photos.result.photos.length == 0) {
        localStorage.removeItem('botavatar');
        $scope.botavatar = './assets/botavatar.png';
      }
    });
  }

  function SaveAdminBot(token) {
    if (!token || token.length < 30) {
      alert('Invalid token');
      return;
    }

    if (!tokenRegex.test(token)) {
      alert('Invalid token format');
      return;
    }

    API = new tgAPI(token);

    API.getMe().then((getMe) => {
      if (getMe.ok) {
        getMe.result.token = token;
        localStorage.setItem('bot', JSON.stringify(getMe.result));
        $scope.adminbot = getMe.result;
        $scope.token = token;
        token = null;

        CloseChangeBotDialog();
        CloseBotDialog();

        UpdateBotProfilePhoto();
      }
    }, (err) => {
      alert('Can\'t find bot with this token');
    });
  }

  function RemoveChannel(id) {
    for (let i in $scope.channels) {
      if ($scope.channels[i].uid === id) {
        $scope.channels.splice(i, 1);
        localStorage.setItem('channels', JSON.stringify($scope.channels));
        break;
      }
    }
  }

  function toggleMultiple() {
    $scope.multiple = !$scope.multiple;
    
    if (!$scope.multiple) {
      let sel = false;
      for (let i in $scope.channels) {
        if ($scope.selected[$scope.channels[i].uid]) {
          if (sel) delete $scope.selected[$scope.channels[i].uid];
          sel = true;
        }
      }
    }
  }

  function updatePreview() {
    if ($scope.parser === null) {
      $('#preview').text($scope.post_text).html();
    } else {
      $('#preview').html(parser({
        mode: $scope.parser,
        data: $scope.post_text || ''
      }));
    }
  }

  function selectParser(type) {
    if ($scope.parser === type) {
      $scope.parser = null;
    } else {
      $scope.parser = type;
    }
  }

  function toggleSelection(uid) {
    $scope.selected[uid] = !$scope.selected[uid];
  }

  function insertLink() {
    if ($scope.parser === null) {
      alert("Select formatting style.");
      return;
    }

    let postDOM = document.getElementById('post_text');

    let selStart = postDOM.selectionStart;
    let selEnd = postDOM.selectionEnd;

    $scope.insertLinkTitle = null;
    $scope.insertLinkURL = null;
    if (selStart !== selEnd) {
      $scope.insertLinkTitle = $scope.post_text.substring(selStart, selEnd);
    }
    
    OpenInsertLinkDialog();
  }

  function insertLinkInText() {
    let postDOM = document.getElementById('post_text');

    let selStart = postDOM.selectionStart;
    let selEnd = postDOM.selectionEnd;

    let res;
    if ($scope.parser === 'markdown')  {
      res = `[${$scope.insertLinkTitle}](${$scope.insertLinkURL})`;
    } else if ($scope.parser === 'HTML') {
      res = `<a href="${$scope.insertLinkURL}">${$scope.insertLinkTitle}</a>`;
    }

    $scope.post_text = $scope.post_text.substring(0, selStart) + res + $scope.post_text.substring(selEnd, $scope.post_text.length);
    postDOM.value = $scope.post_text;
    postDOM.setSelectionRange(selStart, selStart + res.length);
    postDOM.focus();

    CloseInsertLinkDialog();
    updatePreview();
  }

  function insertBold() {
    let postDOM = document.getElementById('post_text');

    let selStart = postDOM.selectionStart;
    let selEnd = postDOM.selectionEnd;

    let text = $scope.post_text.substring(selStart, selEnd);
    if (text.length === 0) text = 'bold';

    let res;
    if ($scope.parser === 'markdown')  {
      res = `*${text}*`;
    } else if ($scope.parser === 'HTML') {
      res = `<b>${text}</b>`;
    }

    $scope.post_text = $scope.post_text.substring(0, selStart) + res + $scope.post_text.substring(selEnd, $scope.post_text.length);
    postDOM.value = $scope.post_text;
    postDOM.setSelectionRange(selStart, selStart + res.length);
    postDOM.focus();

    updatePreview();
  }

  function insertItalic() {
    let postDOM = document.getElementById('post_text');

    let selStart = postDOM.selectionStart;
    let selEnd = postDOM.selectionEnd;

    let text = $scope.post_text.substring(selStart, selEnd);
    if (text.length === 0) text = 'italic';

    let res;
    if ($scope.parser === 'markdown')  {
      res = `_${text}_`;
    } else if ($scope.parser === 'HTML') {
      res = `<i>${text}</i>`;
    }

    $scope.post_text = $scope.post_text.substring(0, selStart) + res + $scope.post_text.substring(selEnd, $scope.post_text.length);
    postDOM.value = $scope.post_text;
    postDOM.setSelectionRange(selStart, selStart + res.length);
    postDOM.focus();

    updatePreview();
  }

  function sendPost() {
    $scope.sending = true;

    let url = baseUrl + $scope.token;
    let listToSend = [];

    for (let i in $scope.channels) {
      if ($scope.selected[$scope.channels[i].uid]) {
        listToSend.push($scope.channels[i].username)
      }
    }
    
    let params = {
      text: $scope.post_text,
      disable_web_page_preview: $scope.disablePreview,
      disable_notification: $scope.disableNotification
    };

    if ($scope.parser !== null) params.parse_mode = $scope.parser;

    function sendRec(list, onend) {
      params.chat_id = list[0];
      $http.post(
        url + '/sendMessage',
        params
      ).then((success) => {
        if (success.data.ok) {
          list.splice(0, 1);
          if (list.length > 0) {
            sendRec(list, onend);
          }
        } else {
          alert('Something went wrong');
        }
        if (list.length === 0) {
          onend();
        }
      });
    }

    sendRec(listToSend, () => {
      $scope.post_text = null;
      updatePreview();
      $scope.sending = false;
    });
  }

  
  
  $scope.OpenChannelDialog = OpenChannelDialog;
  $scope.CloseChannelDialog = CloseChannelDialog;
  $scope.OpenBotDialog = OpenBotDialog;
  $scope.CloseBotDialog = CloseBotDialog;
  $scope.OpenChangeBotDialog = OpenChangeBotDialog;
  $scope.CloseChangeBotDialog = CloseChangeBotDialog;
  $scope.OpenInsertLinkDialog = OpenInsertLinkDialog;
  $scope.CloseInsertLinkDialog = CloseInsertLinkDialog;
  $scope.SaveChannel = SaveChannel;
  $scope.RemoveChannel = RemoveChannel;
  $scope.SaveAdminBot = SaveAdminBot;
  $scope.toggleMultiple = toggleMultiple;
  $scope.updatePreview = updatePreview;
  $scope.selectParser = selectParser;
  $scope.toggleSelection = toggleSelection;
  $scope.insertLink = insertLink;
  $scope.insertLinkInText = insertLinkInText;
  $scope.insertBold = insertBold;
  $scope.insertItalic = insertItalic;
  $scope.sendPost = sendPost;
  $scope.UpdateBotProfilePhoto = UpdateBotProfilePhoto;
});

function uid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}
