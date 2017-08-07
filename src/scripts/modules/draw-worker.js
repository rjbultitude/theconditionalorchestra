'use strict';

module.exports = function (self) {
    var interval;
    self.addEventListener('message', function(e) {
        console.log(e.data);
        if (e.data.draw) {
            interval = setInterval(function() {
                self.postMessage('tick');
            }, 1000 / e.data.rate);
        } else {
            clearInterval(interval);
            self.close();
        }
    }, false);
};