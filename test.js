var SplayTree = require('./splay').SplayTree,
    assert = require('assert');

var n = 1e6;

function time(text, fn) {
  var start = +(new Date);
  fn()
  var end = +(new Date);
  console.log(text, (end - start) / 1000 + 'sec');
}

time(n + ' prepends and nths on plain tree', function() {
  var x = new SplayTree();
  for (var j = 0; j < n; ++j) {
    x.prepend('node' + j);
    var k = Math.floor(Math.random() * x.size());
    loc = x.nth(k);
    assert(loc._V == 'node' + (j - k));
  }
});

time(n + ' prepends and finds on total-length tree', function() {
  var x = new SplayTree(['length']);
  var total = 0;
  for (var j = 0; j < n; ++j) {
    var s = 'node' + j;
    total += s.length;
    x.prepend(s);
    var k = Math.floor(Math.random() * total);
    loc = x.find('length', k);
  }
});


