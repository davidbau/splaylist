var SplayList = require('../splaylist').SplayList,
    assert = require('assert');

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
assert.deepEqual(list.toArray(),
  ["Banana", "Orange", "Lemon", "Kiwi", "Apple", "Mango"]);
assert.deepEqual(list.splice(3, 2),
  ["Kiwi", "Apple"]);
assert.deepEqual(list.toArray(1, 2),
  ["Orange", "Lemon"]);
assert.deepEqual(list.toArray(),
  ["Banana", "Orange", "Lemon", "Mango"]);
assert.deepEqual(list.splice(2),
  ["Lemon", "Mango"]);
assert.deepEqual(list.toArray(),
  ["Banana", "Orange"]);
assert.deepEqual(list.splice(null, 0, "Pear", "Peach", "Plum"),
  []);
assert.deepEqual(list.toArray(),
  ["Banana", "Orange", "Pear", "Peach", "Plum"]);

// TODO: add tests
// Use removeRange to remove without copying.
// Use splice, removeAt, removeRange with locations instead of integers.

