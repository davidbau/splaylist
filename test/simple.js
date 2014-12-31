var SplayList = require('../splaylist').SplayList,
    assert = require('assert');

x = new SplayList();
for (var j = 0; j < 10; ++j) {
 x.append('node' + j);
}
console.log(x.toString());
for (j = 0; j < 10; ++j) {
  x.nth(j);
  console.log(x.toString());
}
