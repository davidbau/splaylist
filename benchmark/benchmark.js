var SplayList = require('../src/splaylist').SplayList,
    assert = require('assert');

var n = 1e5;
var trials = 20;
var x;

function time(text, fn) {
  var min = Infinity;
  for (var j = 0; j < trials; ++j) {
    var start = +(new Date);
    fn()
    var end = +(new Date);
    min = Math.min(min, end - start);
  }
  console.log(text, (end - start) / 1000 + 'sec');
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

var rand = (function() {
  var w = 0;
  return function(max) {
    w = (w + 0x61c88647) | 0;
    return (w ^ (w >> 16)) % max;
  }
})();

time(n + ' unshifts and nths on plain tree', function() {
  x = new SplayList();
  for (var j = 0; j < n; ++j) {
    x.unshift('node' + j);
    x.nth(rand(x.length));
  }
});

