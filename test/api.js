var SplayList = require('../src/splaylist').SplayList,
    blanket = require('blanket'),
    assert = require('assert');

describe('SplayList API', function() {
var list = new SplayList(), loc1, loc2, loc3, loc4;

it('supports fast push and pop', function() {
assert.equal(list.push("first", "second"), 2);
assert.equal(list.pop(), "second");
loc1 = list.last();
});

it('supports fast shift and unshift', function() {
// Use with shift/unshift is also fast.
assert.equal(list.unshift("also", "unshifted"), 3);
assert.equal(list.shift(), "also");
loc4 = list.first();
assert.equal(list.length, 2);
});

it('supports insertBefore and insertAfter', function() {
// Insertion is O(microseconds) when at a new spot.
loc3 = list.insertAfter(loc1, "after");
loc2 = list.insertBefore(loc1, "before");
});

it('provides values using val()', function() {
// Values at locations are dereferenced using val(), instant.
assert.equal(loc1.val(), 'first');
assert.equal(loc2.val(), 'before');
assert.equal(loc3.val(), 'after');
assert.equal(loc4.val(), 'unshifted');
});

it('makes tree visualization using toString', function() {
// Visualize the splay tree structure with toString().
// (Most recent location is usually at the root.)
assert.equal(list.toString(),
  "   ┌╴after {n:1}\n" +
  " ┌╴first {n:2}\n" +
  "━before {n:4}\n" +
  " └╴unshifted {n:1}\n"
);

assert.equal((new SplayList).toString(), "empty\n");

assert.equal((new SplayList('a','b','c')).toString(),
 "   ┌╴c {n:1}\n" +
 " ┌╴b {n:2}\n" +
 "━a {n:3}\n"
);

});

it('allows traversal using first/next', function() {
// Traveral is O(nanoseconds) using first and next, or last and prev.
var expect = [loc4, loc2, loc1, loc3];
for (var it = list.first(); it !== null; it = it.next()) {
  assert.equal(expect.shift().val(), it.val());
}
});

it('allows traversal using last/prev', function() {
var expect = [loc3, loc1, loc2, loc4];
for (var it = list.last(); it !== null; it = it.prev()) {
  assert.equal(expect.shift().val(), it.val());
}
});

it('supports chaining of last/prev', function() {
assert.equal(list.last(), loc3);
assert.equal(list.last().prev(), loc1);
});

it('can find locations using nth', function() {
// Quickly find a location by index, O(microseconds).
assert.equal(list.nth(0), loc4);
assert.equal(list.nth(1), loc2);
assert.equal(list.nth(2), loc1);
assert.equal(list.nth(3), loc3);
});

it('can find provide access using get', function() {
// Simple array-like access, O(microsectonds).
assert.equal(list.get(0), 'unshifted');
assert.equal(list.get(1), 'before');
assert.equal(list.get(2), 'first');
assert.equal(list.get(3), 'after');
});

it('can copy to an array using slice', function() {
// Copy to an array with slice.
assert.deepEqual(list.slice(), ['unshifted', 'before', 'first', 'after']);
assert.deepEqual(list.slice(1,3), ['before', 'first']);
});

it('can discover index of a location', function() {
// Quickly discover index of any location, O(microseconds).
assert.equal(list.index(loc1), 2);
assert.equal(list.index(loc2), 1);
assert.equal(list.index(loc3), 3);
assert.equal(list.index(loc4), 0);
});

it('can remove individual elements', function() {
// Removal is O(microseconds).
assert.equal(list.length, 4);
list.removeAt(loc1);
assert.equal(list.length, 3);
assert.equal(list.nth(2), loc3);
assert.equal(list.pop(), 'after');
assert.equal(list.shift(), 'unshifted');
assert.equal(list.length, 1);
assert.equal(list.get(0), 'before');
});

it('can splice elements', function() {
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
});

it('can splice and remove ranges', function() {
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
});

it('can insertBefore multiple arguments', function() {
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
});

it('can insertAfter multiple arguments', function() {
// insertAfter can accept multiple arguments.
// It returns the location of the first one inserted, if any.
var loca = list.insertAfter(list.last().prev(), "Pumpkin", "Squash");
assert.equal(loca.val(), "Pumpkin");
assert.equal(loca.next().val(), "Squash");
assert.equal(list.last().prev(), loca.next());

// insertAfter null is the same as unshift.
var locp = list.insertAfter(null, "Almond");
assert.equal(locp, list.first());

});

});
