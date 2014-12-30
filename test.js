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
var start, end;

start = +(new Date);
var x = new SplayTree({
  n: function() { return 1; }
//  length: function(v) { return v.length }
});
end = +(new Date);
console.log('time: ' + (end - start) + 'ms for constructor');

start = +(new Date);
for (var j = 0; j < n; ++j) {
  x.prepend('node' + j);
  var k = Math.floor(Math.random() * x.size());
  loc = x.nth(k);
  assert(loc._V == 'node' + (j - k));
}
end = +(new Date);
console.log('time: ' + (end - start) + 'ms for ' + n + ' appends and lookups');

start = +(new Date);
var total = 0;
for (var loc = x.first(); loc !== null; loc = x.next(loc)) {
  total += loc._V.length;
}
console.log('traverse total', total);
end = +(new Date);
console.log('time: ' + (end - start) + 'ms for ' + n + ' next()s');

var total = x.stat('length');
console.log('cached total', total);

// x.dump();
console.log('total length:', x.stat('length'));

