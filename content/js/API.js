class TelegramAPI {
  constructor(token) {
    this.token = token;
    this.methodURL = 'https://api.telegram.org/bot' + token + '/';
    this.fileURL = 'https://api.telegram.org/file/bot' + token + '/';
  }

  post(methodName, params) {
    return $.post(this.methodURL + methodName, params)
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
      xhr.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){
          //this.response is what you're looking for
          resolve(this.response);
        }
      }
      xhr.open('GET', this.fileURL + path);
      xhr.responseType = 'blob';
      xhr.send();      
    });
  }
}

module.exports = TelegramAPI;