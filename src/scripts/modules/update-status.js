'use strict';

var statusMsgs = require('./messages');

module.exports = function updateStatus(status, locationAddress) {
  var icons = document.querySelectorAll('[data-ref="status-icon"]');
  var messageBlock = document.getElementById('message-block');

  console.log('status', status);
  console.log('locationAddress', locationAddress);

  if (statusMsgs[status] === undefined || isNaN(statusMsgs[status])) {
    console.log('status errors. cannot find key ', status);
  } else {
    messageBlock.innerHTML = statusMsgs[status];
  }

  if (locationAddress !== undefined || locationAddress !== null) {
    messageBlock.innerHTML = statusMsgs[status] + locationAddress;
  } else {
    console.log('locationAddress likely undefined');
  }

  for (var i = 0; i < icons.length; i++) {
    if(icons[i].getAttribute('id') === status) {
      console.log('icon attr', icons[i].getAttribute('id'));
      icons[i].style.display = 'inline-block';
    } else {
      icons[i].style.display = 'none';
    }
  }
};
