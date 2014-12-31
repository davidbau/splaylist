var SplayTree = require('./splay').SplayTree,
    assert = require('assert');

x = new SplayTree();
for (var j = 0; j < 10; ++j) {
 x.append('node' + j);
}
x.dump();
for (j = 0; j < 10; ++j) {
  x.nth(j);
  x.dump();
}
