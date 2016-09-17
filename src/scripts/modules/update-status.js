'use strict';

var statusMsgs = require('./messages');

module.exports = function updateStatus(status, locationAddress, noAudioSupport) {
  var icons = document.querySelectorAll('[data-ref=status-icon]');
  var messageBlock = document.getElementById('message-block');
  var messagesParent = messageBlock.parentNode;

  if (noAudioSupport) {
    var noAudioEl = document.createElement('p');
    noAudioEl.innerHTML = statusMsgs.noAudio;
    console.log('noAudioEl', noAudioEl);
    messagesParent.insertBefore(noAudioEl, messageBlock);
    if (locationAddress) {
      messageBlock.innerHTML = statusMsgs.noAudioPlaying + locationAddress;
    }
    return;
  }

  //Absent key handler
  if (statusMsgs[status] === undefined) {
    console.log('status errors. cannot find key ', status);
  } else {
    messageBlock.innerHTML = statusMsgs[status];
  }

  //Absent location address handler
  if (locationAddress !== undefined) {
    messageBlock.innerHTML = statusMsgs[status] + locationAddress;
  }
  //Update icons
  for (var i = 0; i < icons.length; i++) {
    if(icons[i].getAttribute('id') === status) {
      icons[i].style.display = 'inline-block';
    } else {
      icons[i].style.display = 'none';
    }
  }
};
