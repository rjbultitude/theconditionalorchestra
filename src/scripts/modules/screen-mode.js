'use strict';

module.exports = function() {
	var scnBtn = document.getElementById('full-screen');
	var containerEl = document.getElementById('core-content');
	var canvasContainerEl = document.getElementById('canvas-container');
	var closeButton = document.getElementById('close-full-screen');

	function exitFullScreen(event) {
		//Avoid keyboard trap
		console.log('event.target', event.target);
		console.log('event.keyCode', event.keyCode);
		if (event.keyCode === 27 || event.target.parentNode === closeButton) {
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
				closeButton.style.display = 'none';
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
			closeButton.style.display = 'block';
			containerEl.classList.add('active', 'wrapper');
			containerEl.style.paddingBottom = '0';
			canvasContainerEl.style.display = 'block';
		}
	}

	//Open FS
	scnBtn.addEventListener('click', launchFullScreen, false);
	//Close FS
	closeButton.addEventListener('click', exitFullScreen, true);
	window.addEventListener('keypress', exitFullScreen, true);
  window.addEventListener('keydown', exitFullScreen, true);
};
