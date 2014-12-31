seedrandom.js
=============
[![NPM version](https://badge.fury.io/js/seedrandom.svg)](http://badge.fury.io/js/seedrandom)

Splay list with order statistics for Javascript.

version 0.0.0<br>
Author: David Bau<br>
Date: 2014 Dec 31

Can be used as a plain script or a node.js module.


Script tag usage
----------------

<pre>
&lt;script src="splaylist.js"&gt;&lt;/script&gt;
</pre>

<pre>
var list = new SplayList();

// Insertion is O(microseconds) when at a new spot
// and O(nanoseconds) when repeated at the same spot.
var loc1 = list.push("first");
var loc2 = list.insertBefore(loc1, "before");
var loc3 = list.insertAfter(loc1, "after");
var loc4 = list.unshift("unshifted");

// Fast access by index, O(microseconds).
assert.equal(list.nth(0), loc4);
assert.equal(list.nth(1), loc2);
assert.equal(list.nth(2), loc1);
assert.equal(list.nth(3), loc3);

// Fast discovery of current index, O(microseconds).
assert.equal(list.index(loc1), 2);
assert.equal(list.index(loc2), 1);
assert.equal(list.index(loc3), 3);
assert.equal(list.index(loc4), 0);

// Values are dereferenced using val(), O(nanoseconds).
assert.equal(loc1.val(), 'first');
assert.equal(loc2.val(), 'before');
assert.equal(loc3.val(), 'after');
assert.equal(loc4.val(), 'unshifted');

// Traveral is O(nanoseconds) using first and next, or last and prev.
var expect = [loc4, loc2, loc1, loc3];
for (var it = list.first(); it !== null; it = list.next(it)) {
  assert.equal(expect.shift().val(), it.val());
}

// Removal is O(microseconds).
list.remove(loc1);
assert.equal(list.nth(2), loc3);
assert.equal(list.pop(), 'after');
assert.equal(list.shift(), 'unshifted');
assert.equal(list.size(), 1);
assert.equal(list.first().val(), 'before');
</pre>

See test/test.js for an example of overriding orderstats to generalize
to more than one order statistic.

LICENSE (MIT)
-------------

Copyright 2014 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

