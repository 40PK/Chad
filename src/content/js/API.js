const request = require('superagent');

class TelegramAPI {
  constructor(token) {
    this.token = token;
    this.methodURL = 'https://api.telegram.org/bot' + token + '/';
    this.fileURL = 'https://api.telegram.org/file/bot' + token + '/';
  }

  post(methodName, params) {
    return request
      .post(this.methodURL + methodName)
      .send(params);
  }

  getMe() {
    return this.post('getMe', {});
  }

  getUserProfilePhotos(params) {
    return this.post('getUserProfilePhotos', params);
  }

  getFile(params) {
    return this.post('getFile', params);
  }

  getBlobFile(path) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          //this.response is what you're looking for
          resolve(this.response);
        }
      };

      xhr.open('GET', this.fileURL + path);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  getBase64Avatar(id) {
    return new Promise((resolve, reject) => {
      this.getUserProfilePhotos({
        user_id: id,
        limit: 1,
      }).then((photos) => {
        photos = photos.body;
        if (photos.ok && photos.result.photos.length > 0) {
          return photos.result.photos[0];
        } else {
          resolve(null);
        }
      }).then((photo) => this.getFile({
        file_id: photo[photo.length - 1].file_id,
      })).then((file) => {
        file = file.body;
        if (file.ok) {
          return this.getBlobFile(file.result.file_path);
        } else {
          resolve(null);
        }
      }).then((blob) => {
        if (blob) {
          var reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        } else {
          resolve(null);
        }
      });
    });
  }

  sendMessage(params) {
    return this.post('sendMessage', params);
  }

  editMessageText(params) {
    return this.post('editMessageText', params);
  }
}

module.exports = TelegramAPI;
