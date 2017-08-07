'use strict';

module.exports = function (self) {
    var interval;
    var count = 0;
    self.addEventListener('message', function(e) {
        console.log(e.data);
        if (e.data.draw) {
            interval = setInterval(function() {
                count++;
                console.log('worker thread count', count);
                self.postMessage({msg: 'tick'});
            }, 1000 / e.data.rate);
        } else {
            clearInterval(interval);
            self.close();
        }
    }, false);
};