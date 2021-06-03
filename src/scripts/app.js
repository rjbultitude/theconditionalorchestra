import '../styles/global.scss';

var Tabs = require('./modules/tabs.js');
var jsLoad = require('./utilities/js-load.js');
var updateStatus = require('./modules/update-status.js');
require('./utilities/browser-tab-visibility.js');

function deleteCookies() {
  var theCookies = document.cookie.split(';');
  for (var i = 0 ; i < theCookies.length; i++) {
    document.cookie = theCookies[i].split('=')[0] + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

navigator.serviceWorker.getRegistrations()
  .then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
        .then(function() {
          return self.clients.matchAll();
        })
        .then(function(clients) {
          clients.forEach(client => {
            if (client.url && "navigate" in client) {
              client.navigate(client.url);
            }
          });
        })
    }
  });

// var swReg = true;
// if ('serviceWorker' in navigator && swReg) {
//   navigator.serviceWorker.register('./sw.js')
//     .then(function() {
//       console.log('Service worker registered!');
//     }).catch(function(err) {
//       console.log(err);
//     });
// }

deleteCookies();
// Web audio support?
if (!window.AudioContext && !window.webkitAudioContext) {
  updateStatus('noAudio');
  console.log('No Audio Context');
} else {
  // Get url
  var splitUrl = location.href.split('?');
  var query = splitUrl[1];
  // start app
  var coordsForm = require('./modules/coords-form');
  var audioVisual = require('./modules/audio-visual');
  coordsForm(query);
  audioVisual();
  jsLoad();
  new Tabs( document.querySelector('[data-directive=tabs]') );
}
