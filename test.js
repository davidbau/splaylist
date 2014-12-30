var SplayTree = require('./splay').SplayTree,
    assert = require('assert');

var n = 1e6;

function time(text, fn) {
  var start = +(new Date);
  fn()
  var end = +(new Date);
  console.log(text, (end - start) / 1000 + 'sec');
}

var x;

time(n + ' prepends and nths on plain tree', function() {
  x = new SplayTree();
  for (var j = 0; j < n; ++j) {
    x.prepend('node' + j);
    var k = Math.floor(Math.random() * x.size());
    loc = x.nth(k);
    assert(loc.val() == 'node' + (j - k));
  }
});

time('start-to-end traversal on a ' + n + ' plain tree', function() {
  var loc = x.first();
  while (loc !== null) {
    loc = x.next(loc);
  }
});

time(n + ' prepends and finds on total-length tree', function() {
  x = new SplayTree(function(s) { return {n: 1, length: s.length }; });
  var total = 0;
  for (var j = 0; j < n; ++j) {
    var s = 'node' + j;
    total += s.length;
    x.prepend(s);
    var k = Math.floor(Math.random() * total);
    loc = x.find('length', k);
  }
  assert(9888890 == x.stat('length'));
});

time('start-to-end traversal on a ' + n + ' total-length tree', function() {
  var loc = x.first();
  while (loc !== null) {
    loc = x.next(loc);
  }
});


