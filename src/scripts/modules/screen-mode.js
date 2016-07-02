'use strict';
var Promise = require('es6-promise').Promise;

module.exports = function() {
	var scnBtn = document.getElementById('full-screen');
	var containerEl = document.getElementById('main-section');
	console.log('containerEl', containerEl);

	function toggleFullScreen() {
	  if (!document.fullscreenElement) {
			if(containerEl.requestFullscreen) {
				containerEl.requestFullscreen();
			} else if(containerEl.mozRequestFullScreen) {
				containerEl.mozRequestFullScreen();
			} else if(containerEl.webkitRequestFullscreen) {
				containerEl.webkitRequestFullscreen();
			} else if(containerEl.msRequestFullscreen) {
				containerEl.msRequestFullscreen();
			}
			containerEl.classList.add('active');
			containerEl.style.paddingBottom = '0';
	  } else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
				containerEl.classList.remove('active');
				containerEl.style.paddingBottom = '50%';
	    }
	  }
	}

	scnBtn.addEventListener('click', function(e){
		e.preventDefault();
		toggleFullScreen();
	});
};
