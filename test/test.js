// Run simple tests first.
require('./api');
require('./shape');

var SplayList = require('../splaylist').SplayList,
    assert = require('assert');

var n = 1e5;
var splicen = 1e4;
var x;

function time(text, fn) {
  var start = +(new Date);
  fn()
  var end = +(new Date);
  console.log(text, (end - start) / 1000 + 'sec');
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

function array(a) {
  if (a instanceof Array) return a;
  if (!a) return [];
  return a.toArray();
}

time(n + ' unshifts and nths on plain tree', function() {
  x = new SplayList();
  for (var j = 0; j < n; ++j) {
    x.unshift('node' + j);
    var k = Math.floor(Math.random() * x.length);
    loc = x.nth(k);
    assert.equal(loc.val(), 'node' + (j - k));
  }
});

time('start-to-end traversal on a ' + n + ' plain tree', function() {
  var loc = x.first();
  while (loc !== null) {
    loc = loc.next();
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
  assert.equal(888890, x.stat('length'));
});

time('start-to-end traversal on a ' + n + ' total-length tree', function() {
  var loc = x.first();
  while (loc !== null) {
    loc = loc.next();
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
  assert.equal(total, x.stat('k'));
});

time(splicen + ' random splices on a plain tree', function() {
  var lists = [], arrays = [];
  for (var j = 0; j < splicen; ++j) {
    if (!arrays.length) {
      arrays.push([]);
      lists.push(new SplayList);
    }
    var cura = arrays[arrays.length - 1],
        curl = lists[lists.length - 1],
        choice = rand(4);
    if (choice == 2) {
      console.log('push');
      var str = 'node' + j;
      cura.push(str);
      curl.push(str);
    } else if (choice == 3) {
      console.log('unshift');
      var str = 'node' + j;
      cura.unshift(str);
      curl.unshift(str);
    } else {
      arrays.pop();
      lists.pop();
      var start = rand(cura.length),
          len = rand(cura.length - start),
          insa = arrays.pop() || [],
          insl = lists.pop() || null,
          rl, ra, args = [start, len];
      args.push.apply(args, insa);
      ra = cura.splice.apply(cura, args);
      if (choice) {
      console.log('splicelist');
        rl = curl.spliceList(start, len, insl);
      } else {
      console.log('splicearray');
        rl = curl.spliceList(start, len, insl);
        rl = curl.spliceArray(start, len, insa);
      }
      assert.deepEqual(ra, array(rl));
      arrays.push(cura);
      lists.push(curl);
      if (rl instanceof SplayList) {
        arrays.push(ra);
        lists.push(rl);
      }
    }
    if (cura.length != curl.length) {
      console.log(cura.length, cura);
      console.log(curl.length);
      console.log(curl.toString());
    }
    assert.equal(cura.length, curl.length);
    assert.deepEqual(cura, array(curl));
    var index = rand(cura.length);
    assert.equal(cura[0], curl.get(0));
  }
});

