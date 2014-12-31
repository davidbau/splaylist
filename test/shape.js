var SplayList = require('../splaylist').SplayList,
    assert = require('assert');

x = new SplayList();
for (var j = 0; j < 10; ++j) {
 x.push('node' + j);
}

assert.equal(x.toString(),
  "→node9 {n:10}\n" +
  " └╴node8 {n:9}\n" +
  "   └╴node7 {n:8}\n" +
  "     └╴node6 {n:7}\n" +
  "       └╴node5 {n:6}\n" +
  "         └╴node4 {n:5}\n" +
  "           └╴node3 {n:4}\n" +
  "             └╴node2 {n:3}\n" +
  "               └╴node1 {n:2}\n" +
  "                 └╴node0 {n:1}\n");

x.nth(0);
assert.equal(x.toString(),
  "   ┌╴node9 {n:1}\n" +
  " ┌╴node8 {n:9}\n" +
  " │ │ ┌╴node7 {n:1}\n" +
  " │ └╴node6 {n:7}\n" +
  " │   │ ┌╴node5 {n:1}\n" +
  " │   └╴node4 {n:5}\n" +
  " │     │ ┌╴node3 {n:1}\n" +
  " │     └╴node2 {n:3}\n" +
  " │       └╴node1 {n:1}\n" +
  "→node0 {n:10}\n");

x.nth(1);
assert.equal(x.toString(),
  "     ┌╴node9 {n:1}\n" +
  "   ┌╴node8 {n:3}\n" +
  "   │ └╴node7 {n:1}\n" +
  " ┌╴node6 {n:8}\n" +
  " │ │   ┌╴node5 {n:1}\n" +
  " │ │ ┌╴node4 {n:3}\n" +
  " │ │ │ └╴node3 {n:1}\n" +
  " │ └╴node2 {n:4}\n" +
  "→node1 {n:10}\n" +
  " └╴node0 {n:1}\n");

x.nth(2);
assert.equal(x.toString(),
  "     ┌╴node9 {n:1}\n" +
  "   ┌╴node8 {n:3}\n" +
  "   │ └╴node7 {n:1}\n" +
  " ┌╴node6 {n:7}\n" +
  " │ │ ┌╴node5 {n:1}\n" +
  " │ └╴node4 {n:3}\n" +
  " │   └╴node3 {n:1}\n" +
  "→node2 {n:10}\n" +
  " └╴node1 {n:2}\n" +
  "   └╴node0 {n:1}\n");

x.nth(3);
assert.equal(x.toString(),
  "       ┌╴node9 {n:1}\n" +
  "     ┌╴node8 {n:3}\n" +
  "     │ └╴node7 {n:1}\n" +
  "   ┌╴node6 {n:5}\n" +
  "   │ └╴node5 {n:1}\n" +
  " ┌╴node4 {n:6}\n" +
  "→node3 {n:10}\n" +
  " └╴node2 {n:3}\n" +
  "   └╴node1 {n:2}\n" +
  "     └╴node0 {n:1}\n");

x.nth(4);
assert.equal(x.toString(),
  "     ┌╴node9 {n:1}\n" +
  "   ┌╴node8 {n:3}\n" +
  "   │ └╴node7 {n:1}\n" +
  " ┌╴node6 {n:5}\n" +
  " │ └╴node5 {n:1}\n" +
  "→node4 {n:10}\n" +
  " └╴node3 {n:4}\n" +
  "   └╴node2 {n:3}\n" +
  "     └╴node1 {n:2}\n" +
  "       └╴node0 {n:1}\n");

x.nth(5);
assert.equal(x.toString(),
  "     ┌╴node9 {n:1}\n" +
  "   ┌╴node8 {n:3}\n" +
  "   │ └╴node7 {n:1}\n" +
  " ┌╴node6 {n:4}\n" +
  "→node5 {n:10}\n" +
  " └╴node4 {n:5}\n" +
  "   └╴node3 {n:4}\n" +
  "     └╴node2 {n:3}\n" +
  "       └╴node1 {n:2}\n" +
  "         └╴node0 {n:1}\n");

x.nth(6);
assert.equal(x.toString(),
  "   ┌╴node9 {n:1}\n" +
  " ┌╴node8 {n:3}\n" +
  " │ └╴node7 {n:1}\n" +
  "→node6 {n:10}\n" +
  " └╴node5 {n:6}\n" +
  "   └╴node4 {n:5}\n" +
  "     └╴node3 {n:4}\n" +
  "       └╴node2 {n:3}\n" +
  "         └╴node1 {n:2}\n" +
  "           └╴node0 {n:1}\n");

x.nth(7);
assert.equal(x.toString(),
  "   ┌╴node9 {n:1}\n" +
  " ┌╴node8 {n:2}\n" +
  "→node7 {n:10}\n" +
  " └╴node6 {n:7}\n" +
  "   └╴node5 {n:6}\n" +
  "     └╴node4 {n:5}\n" +
  "       └╴node3 {n:4}\n" +
  "         └╴node2 {n:3}\n" +
  "           └╴node1 {n:2}\n" +
  "             └╴node0 {n:1}\n");

x.nth(8);
assert.equal(x.toString(),
  " ┌╴node9 {n:1}\n" +
  "→node8 {n:10}\n" +
  " └╴node7 {n:8}\n" +
  "   └╴node6 {n:7}\n" +
  "     └╴node5 {n:6}\n" +
  "       └╴node4 {n:5}\n" +
  "         └╴node3 {n:4}\n" +
  "           └╴node2 {n:3}\n" +
  "             └╴node1 {n:2}\n" +
  "               └╴node0 {n:1}\n");

x.nth(9);
assert.equal(x.toString(),
  "→node9 {n:10}\n" +
  " └╴node8 {n:9}\n" +
  "   └╴node7 {n:8}\n" +
  "     └╴node6 {n:7}\n" +
  "       └╴node5 {n:6}\n" +
  "         └╴node4 {n:5}\n" +
  "           └╴node3 {n:4}\n" +
  "             └╴node2 {n:3}\n" +
  "               └╴node1 {n:2}\n" +
  "                 └╴node0 {n:1}\n");


