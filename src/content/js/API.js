const request = require('superagent');

class TelegramAPI {
  constructor(token) {
    this.token = token;
    this.methodURL = `https://api.telegram.org/bot${token}/`;
    this.fileURL = `https://api.telegram.org/file/bot${token}/`;
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
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (this.readyState === 4 && this.status === 200) {
          resolve(this.response);
        }
      };
      xhr.open('GET', this.fileURL + path);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  getBase64Avatar(id) {
    return new Promise(resolve => {
      this.getUserProfilePhotos({
        user_id: id,
        limit: 1,
      })
      .then(res => {
        const photos = res.body;
        if (photos.ok && photos.result.photos.length > 0) {
          return photos.result.photos[0];
        }
        resolve(null);
        return null;
      })
      .then(photo => {
        if (photo) {
          this.getFile({
            file_id: photo[photo.length - 1].file_id,
          });
        } else {
          resolve(null);
        }
      })
      .then(res => {
        const file = res.body;
        if (file.ok) {
          return this.getBlobFile(file.result.file_path);
        }
        resolve(null);
        return null;
      })
      .then(blob => {
        if (blob) {
          const reader = new FileReader();
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
