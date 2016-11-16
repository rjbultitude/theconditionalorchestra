'use strict';
var Promise = require('es6-promise').Promise;

module.exports = function makeRequest(method, url, mimeOverride) {

	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.onload = function() {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
          status: this.status,
          statusText: xhr.statusText
        });
			}
		};
    if (mimeOverride) {
      xhr.overrideMimeType(mimeOverride);
    }
    //For network errors
		xhr.onerror = function() {
			reject('error' + xhr.status);
		};
    xhr.onloadend = function() {
      if(xhr.status === 404) {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
		xhr.send();
	});
};
