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
		xhr.onerror = function() {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
};
