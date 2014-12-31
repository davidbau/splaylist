// Run simple tests first.
require('./api');
require('./shape');

var SplayList = require('../splaylist').SplayList,
    assert = require('assert');

var n = 1e6;

function time(text, fn) {
  var start = +(new Date);
  fn()
  var end = +(new Date);
  console.log(text, (end - start) / 1000 + 'sec');
}

var x;

time(n + ' unshifts and nths on plain tree', function() {
  x = new SplayList();
  for (var j = 0; j < n; ++j) {
    x.unshift('node' + j);
    var k = Math.floor(Math.random() * x.length);
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

time(n + ' unshifts and finds on total-length tree', function() {
  x = new SplayList(function(V, X, L, R) {
    var n = 1, len = V.length;
    if (L !== null) { n += L.n; len += L.length; }
    if (R !== null) { n += R.n; len += R.length; }
    X.n = n; X.length = len;
  });
  var total = 0;
  for (var j = 0; j < n; ++j) {
    var s = 'node' + j;
    total += s.length;
    x.unshift(s);
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

var objs = [];
for (var j = 0; j < n; ++j) {
  objs.push({ k: j % 97, s: "node" + j });
}

time(n + ' unshifts and finds on an object tree', function() {
  x = new SplayList(function(V, X, L, R) {
    var n = 1, k = V.k, m = V.s.length;
    if (L !== null) { n += L.n; k += L.k; m += L.m; }
    if (R !== null) { n += R.n; k += R.k; m += R.m; }
    X.n = n; X.k = k; X.m = m;
  });
  var total = 0;
  for (var j = 0; j < n; ++j) {
    total += objs[j].k;
    x.unshift(objs[j]);
    var k = Math.floor(Math.random() * total);
    loc = x.find('k', k);
  }
  assert(total == x.stat('k'));
});

