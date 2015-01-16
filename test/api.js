var SplayList = require('../splaylist').SplayList,
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
var loc2 = list.insertBefore(loc1, "before");
var loc3 = list.insertAfter(loc1, "after");

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

// Values are dereferenced using val(), instant.
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
assert.deepEqual(list.splice(list.nth(3), 2),
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

// Use removeRange to remove without copying, or spliceList to cheaply get a
// list back containing the removed list.
assert.deepEqual(list.spliceList(1, 2).toArray(),
  ["Orange", "Pear"]);
assert.deepEqual(list.toArray(),
  ["Banana", "Peach", "Plum"]);
assert.deepEqual(list.spliceList(1, 0).toArray(),
  []);
assert.deepEqual(list.toArray(),
  ["Banana", "Peach", "Plum"]);
list.removeRange(list.last(), 1);
assert.deepEqual(list.toArray(),
  ["Banana", "Peach"]);
list.spliceList(list.first());
assert.deepEqual(list.toArray(),
  []);
var list2 = new SplayList();
list2.push("Coconut", "Guava", "Papaya");
list.spliceList(0, 0, list2);
assert.equal(list2.length, 0);
assert.deepEqual(list.toArray(), ["Coconut", "Guava", "Papaya"]);
list2.push("Pineapple", "Cherry");
var list3 = list.spliceList(list.first(), list.last(), list2);
assert.deepEqual(list3.toArray(), ["Coconut", "Guava"]);
assert.deepEqual(list.toArray(), ["Pineapple", "Cherry", "Papaya"]);
assert.equal(list.spliceList(null, null, list3).length, 0);
assert.deepEqual(list.toArray(),
  ["Pineapple", "Cherry", "Papaya", "Coconut", "Guava"]);



