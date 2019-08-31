

var classListChainable = require('./class-list-chain');

module.exports = function() {
  window.onload = function() {
    classListChainable(document.getElementsByTagName('html')[0]).remove('no-js').add('js');
  };
};
