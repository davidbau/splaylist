splaylist.js
=============

Splay-tree container with order statistics for Javascript.

version 0.0.0<br>
Author: David Bau<br>
Date: 2014 Dec 31

A SplayList is an array-like container that provides **both** fast
array-index and fast list-insertion access.  It is useful for
situations such as tracking an array of thousands of lines of
text when insertions and deletions must be instant, yet where
indexing by line number or character must also be fast,

This array-or-list replacement provides:

* A linked-list interface with O(1) (nanosecond) next() and prev(), and
  O(log n) (microsecond) insert(), remove(), splice() operations. These
  operations are all fast regardless of the number of elements.
* An array-style interface for skipping to the nth(i) item, or getting
  or setting the value at the ith position.
* An order-statistic interface, for determining the integer position
  of a node in O(log n) (microsecond) time.  Additional order statistics,
  tracking running sums of any nonnegative weights of each value, can
  be added by subclassing SplayList.

Internally a SplayList is an automatically balanced splay tree.  In practice,
splay trees perform better than O(log n) because they take advantage
of the typical locality of access in real applications.

This library is packaged to be used as a plain script or a node.js module.

Script tag usage
----------------

<pre>
&lt;script src="splaylist.js"&gt;&lt;/script&gt;
</pre>

<pre>
var list = new SplayList();
// See below....
</pre>

Node.js usage
-------------

<pre>
var SplayList = require('splaylist').SplayList,
    assert = require('assert');

var list = new SplayList();

// Use as a push/pop stack is O(nanoseconds).
assert.equal(list.push("first", "second"), 2);
assert.equal(list.pop(), "second");
var loc1 = list.last();

// Use with shift/unshift is also fast.
assert.equal(list.unshift("also", "unshifted"), 3);
assert.equal(list.shift(), "also");
var loc4 = list.first();
assert.equal(list.length, 2);

// Insertion is O(microseconds) when at a new spot.
var loc3 = list.insertAfter(loc1, "after");
var loc2 = list.insertBefore(loc1, "before");

// Values at locations are dereferenced using val(), instant.
assert.equal(loc1.val(), 'first');
assert.equal(loc2.val(), 'before');
assert.equal(loc3.val(), 'after');
assert.equal(loc4.val(), 'unshifted');

// Visualize the splay tree structure with toString().
// (Most recent location is usually at the root.)
assert.equal(list.toString(),
  "   ┌╴after {n:1}\n" +
  " ┌╴first {n:2}\n" +
  "━before {n:4}\n" +
  " └╴unshifted {n:1}\n"
);

// Traveral is O(nanoseconds) using first and next, or last and prev.
var expect = [loc4, loc2, loc1, loc3];
for (var it = list.first(); it !== null; it = it.next()) {
  assert.equal(expect.shift().val(), it.val());
}
assert.equal(list.last(), loc3);
assert.equal(list.last().prev(), loc1);

// Quickly find a location by index, O(microseconds).
assert.equal(list.nth(0), loc4);
assert.equal(list.nth(1), loc2);
assert.equal(list.nth(2), loc1);
assert.equal(list.nth(3), loc3);

// Simple array-like access, O(microsectonds).
assert.equal(list.get(0), 'unshifted');
assert.equal(list.get(1), 'before');
assert.equal(list.get(2), 'first');
assert.equal(list.get(3), 'after');

// Copy to an array with slice.
assert.deepEqual(list.slice(), ['unshifted', 'before', 'first', 'after']);
assert.deepEqual(list.slice(1,3), ['before', 'first']);

// Quickly discover index of any location, O(microseconds).
assert.equal(list.index(loc1), 2);
assert.equal(list.index(loc2), 1);
assert.equal(list.index(loc3), 3);
assert.equal(list.index(loc4), 0);

// Removal is O(microseconds).
assert.equal(list.length, 4);
list.removeAt(loc1);
assert.equal(list.length, 3);
assert.equal(list.nth(2), loc3);
assert.equal(list.pop(), 'after');
assert.equal(list.shift(), 'unshifted');
assert.equal(list.length, 1);
assert.equal(list.get(0), 'before');

// Use splice just like Array.splice.
assert.deepEqual(list.splice(0, 1, "Banana", "Orange", "Apple", "Mango"),
  ["before"]);
assert.deepEqual(list.splice(2, 0, "Lemon", "Kiwi"),
  []);
assert.deepEqual(list.slice(),
  ["Banana", "Orange", "Lemon", "Kiwi", "Apple", "Mango"]);
assert.deepEqual(list.splice(list.nth(3), 2),
  ["Kiwi", "Apple"]);
assert.deepEqual(list.slice(1, 3),
  ["Orange", "Lemon"]);
assert.deepEqual(list.slice(),
  ["Banana", "Orange", "Lemon", "Mango"]);
assert.deepEqual(list.splice(2),
  ["Lemon", "Mango"]);
assert.deepEqual(list.slice(),
  ["Banana", "Orange"]);
assert.deepEqual(list.splice(null, 0, "Pear", "Peach", "Plum"),
  []);
assert.deepEqual(list.slice(),
  ["Banana", "Orange", "Pear", "Peach", "Plum"]);

// Use removeRange to remove without copying, or spliceList to cheaply get a
// list back containing the removed list.
assert.deepEqual(list.spliceList(1, 2).slice(),
  ["Orange", "Pear"]);
assert.deepEqual(list.slice(),
  ["Banana", "Peach", "Plum"]);
assert.deepEqual(list.spliceList(1, 0).slice(),
  []);
assert.deepEqual(list.slice(),
  ["Banana", "Peach", "Plum"]);
list.removeRange(list.last(), 1);
assert.deepEqual(list.slice(),
  ["Banana", "Peach"]);
list.spliceList(list.first());
assert.deepEqual(list.slice(),
  []);
var list2 = new SplayList();
list2.push("Coconut", "Guava", "Papaya");
list.spliceList(0, 0, list2);
assert.equal(list2.length, 0);
assert.deepEqual(list.slice(), ["Coconut", "Guava", "Papaya"]);
list2.push("Pineapple", "Cherry");
var list3 = list.spliceList(list.first(), list.last(), list2);
assert.deepEqual(list3.slice(), ["Coconut", "Guava"]);
assert.deepEqual(list.slice(), ["Pineapple", "Cherry", "Papaya"]);
assert.equal(list.spliceList(null, null, list3).length, 0);
assert.deepEqual(list.slice(),
  ["Pineapple", "Cherry", "Papaya", "Coconut", "Guava"]);

// insertBefore can accept multiple arguments.
// it returns the location of the first one inserted, if any.
var locb = list.insertBefore(list.first().next(), "Blueberry", "Raspberry");
assert.equal(locb.val(), "Blueberry");
assert.equal(locb.next().val(), "Raspberry");
assert.equal(list.first().next(), locb);

// insertBefore null is the same as push.
var locp = list.insertBefore(null, "Watermelon");
assert.equal(locp.val(), "Watermelon");
assert.equal(locp, list.last());

// insertAfter can accept multiple arguments.
// It returns the location of the first one inserted, if any.
var loca = list.insertAfter(list.last().prev(), "Pumpkin", "Squash");
assert.equal(loca.val(), "Pumpkin");
assert.equal(loca.next().val(), "Squash");
assert.equal(list.last().prev(), loca.next());

// insertAfter null is the same as unshift.
var locp = list.insertAfter(null, "Almond");
assert.equal(locp, list.first());
</pre>

Order Statistics
----------------

By default, the list tracks an "n" statistic: the number of locations
before any given location.

<pre>
// Stat returns the total of a statistic to the left of a location.
assert.equal(list.stat('n', loc), list.index(loc));
// Find returns the leftmost location where the sum of the stat up
// to that location is at least a given value.
assert.equal(list.find('n', i), list.nth(i));
</pre>

It is possible to extend SplayList to track other order statistics
beyond n; just override the orderstats method.  The SplayList class
has an extend method for conveniently creating subclasses that
override SplayList methods.  The orderstats method is passed
four arguments.  It must fill in sum statistics in X to reflect the
sum of the contribution of value V as well as subtrees L and R.
Either or both of L and R may be null.

<pre>
var OrderList = SplayList.extend({
  orderstats: function(V, X, L, R) {
    // Calculate contriutions of V.
    var n = 1,
        k = V.k,
        m = V.s.length;
    // Add contributions of L and R.
    if (L !== null) { n += L.n; k += L.k; m += L.m; }
    if (R !== null) { n += R.n; k += R.k; m += R.m; }
    // Store the result in X.
    X.n = n;
    X.k = k;
    X.m = m;
  }
});
</pre>

The example above defines stats "n", "k", and "m".  If orderstats is
overridden, the statistic "n" should count elements, as above.

See test/test.js for an example of overriding orderstats to generalize
to more than one order statistic.

LICENSE (MIT)
-------------

Copyright 2015 David Bau.

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

