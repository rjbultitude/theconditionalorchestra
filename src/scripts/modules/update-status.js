'use strict';

var statusMsgs = require('./messages');

module.exports = function updateStatus(status, locationAddress) {
  var icons = document.querySelectorAll('[data-ref=status-icon]');
  var messageBlock = document.getElementById('message-block');

  // console.log('status', status);
  // console.log('locationAddress', locationAddress);
  // console.log('statusMsgs[status]', statusMsgs[status]);

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
