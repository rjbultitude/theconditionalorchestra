'use strict';

module.exports = function() {
	var scnBtn = document.getElementById('full-screen');
	var containerEl = document.getElementById('core-content');

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
			containerEl.classList.add('active', 'wrapper');
			containerEl.style.paddingBottom = '0';
	  } else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
				containerEl.classList.remove('active', 'wrapper');
				containerEl.style.paddingBottom = '50%';
	    }
	  }
	}

	scnBtn.addEventListener('click', function(e){
		e.preventDefault();
		toggleFullScreen();
	});
};
