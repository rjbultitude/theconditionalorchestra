'use strict';

module.exports = function() {
	var scnBtn = document.getElementById('full-screen');
	var containerEl = document.getElementById('core-content');
	var canvasContainerEl = document.getElementById('canvas-container');
	var closeButton = document.getElementById('close-full-screen');

	function exitFullScreen(event) {
		//Avoid keyboard trap
		console.log('event', event);
		if (event.keyCode === 27 || event.target === closeButton) {
				if(document.exitFullscreen) {
					document.exitFullscreen();
				} else if(document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if(document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
				event.cancelBubble = true;
				event.stopPropagation();
				containerEl.classList.remove('active', 'wrapper');
				canvasContainerEl.style.display = 'none';
				return false;
		}
	}

	function launchFullScreen() {
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
			canvasContainerEl.style.display = 'block';
		}
	}

	scnBtn.addEventListener('click', launchFullScreen, false);
	closeButton.addEventListener('click', exitFullScreen, true);

	window.addEventListener('keypress', exitFullScreen, true);
  window.addEventListener('keydown', exitFullScreen, true);
};
