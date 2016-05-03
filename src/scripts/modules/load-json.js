'use strict';

module.exports = function () {

	return function(file, callback, errorCallback) {
		var xhr = new XMLHttpRequest();
		xhr.callback = callback;
		if (xhr.overrideMimeType) {
			xhr.overrideMimeType('application/json');
		}
		xhr.ontimeout = function() {
			console.error('The request for ' + file + ' timed out.');
		};
		xhr.open('GET', file, true);
		xhr.onload = function() {
			if (this.readyState === 4) {
				var thisResponseText = this.responseText;
				var thisResponseJSON = JSON.parse(thisResponseText);
				this.callback(thisResponseJSON);
			}
		};
		xhr.onerror = function() {
			errorCallback(xhr.statusText);
		};
		xhr.timeout = 200;
		xhr.send(null);
	};
};