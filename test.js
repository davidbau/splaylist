var SplayTree = require('./splay').SplayTree,
    assert = require('assert');

/*
var x = new SplayTree();
for (var j = 0; j < 7; ++j) {
  x.append('node' + j);
}
for (j = 0; j < 7; ++j) {
  var loc = x.nth(j);
  console.log(j + ": " + loc._V);
  x.dump();
}
*/


var n = 1e6;

var start = +(new Date);

/*
var y = [];
for (var j = 0; j < n; ++j) {
  y.unshift(j);
  var k = Math.floor(Math.random() * y.length);
  assert(y[k] == j - k);
}
*/

var x = new SplayTree();
for (var j = 0; j < n; ++j) {
  x.prepend(j);
  var k = Math.floor(Math.random() * x.size());
  loc = x.nth(k);
  assert(loc._V == (j - k));
}

var end = +(new Date);
console.log('time: ' + (end - start) + 'ms for ' + n + ' appends and lookups');

