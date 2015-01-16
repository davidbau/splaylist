// SplayList

// Implements a linked list with logarithmic performance for
// random-access array operations.
//
// var list = new SplayList();
//
// Use like an array without worrying about insertion cost.
// list.push("last");
// assert.equal(list.get(0), "last");
// list.splice(0, 0, "inserted", "second");
// assert.equal(list.get(0), "inserted");
//
// Use like a linked list without worrying about random-access cost.
// var last = list.last();
// var mid = list.prev(last);
// assert.equal(mid.val(), "second")
// list.removeAt(mid);
// assert.equal(list.get(1), "last");
// assert.equal(list.nth(1), last);

var assert = require('assert');

(function(exports) {

var Location = function(value) {
  this._P = null;
  this._L = null;
  this._R = null;
  this._V = value;
};

Location.prototype = {
  constructor: Location,
  val: function() { return this._V; },
  next: function() {
    var loc = this, next = loc._R;
    if (next !== null) {
      for (loc = next._L; loc != null; loc = next._L) {
        next = loc;
      }
    } else {
      for (next = loc._P; next != null && next._R === loc; next = loc._P) {
        loc = next;
      }
    }
    return next;
  },
  prev: function() {
    var loc = this, prev = loc._L;
    if (prev !== null) {
      for (loc = prev._R; loc != null; loc = prev._R) {
        prev = loc;
      }
    } else {
      for (prev = loc._P; prev != null && prev._L === loc; prev = loc._P) {
        loc = prev;
      }
    }
    return prev;
  },
  toString: function() {
    var total = {}, k;
    for (k in this) if (k.charAt(0) != '_') total[k] = this[k];
    return this._V.toString() + ' ' +
      JSON.stringify(total).replace(/"(\w+)":/g, "$1:").replace(/\s+/g, ' ');
  }
};

function reorder(tree, X) {
  tree.orderstats(X._V, X, X._L, X._R);
}

function leftRootedRotate(x) {
  //       x                 y
  //     /   \             /   \
  //    L     y           x    RR
  //        /   \       /   \
  //       RL   RR     L    RL
  var y = x._R;
  x._R = y._L;
  if (y._L !== null) y._L._P = x
  y._L = x;
  x._P = y;
  return y;
}

// Left rotation, swaps a node's right child in for the node,
// pushing the node down to the left and fixing up parent pointers.
// Does not update order statistics.
function leftRotate(tree, x) {
  var p = x._P,
      y = leftRootedRotate(x);
  if (p === null) tree._root = y;
  else if (x === p._L) p._L = y;
  else p._R = y;
  y._P = p;
}

// Right rotation without fixing up parents of x; appropriate
// when splaying downward, or when splaying at the root.
function rightRootedRotate(x) {
  //         x            y
  //       /   \        /   \
  //      y     R      LL    x
  //    /   \              /   \
  //   LL   LR            LR    R
  var y = x._L;
  x._L = y._R;
  if (y._R !== null) y._R._P = x
  y._R = x
  x._P = y;
  return y;
}

// Right rotation, swaps a node's left child in for the node,
// pushing the node down to the right and fixing up parent pointers.
// Does not update order statistics.
function rightRotate(tree, x) {
  var p = x._P,
      y = rightRootedRotate(x);
  if (p === null) tree._root = y;
  else if (x === p._L) p._L = y;
  else p._R = y;
  y._P = p;
}

// Splays the node x to the root.
function splayUp(tree, x) {
  for (var p = x._P; p !== null; p = x._P) {
    var g = p._P;
    if (g === null) {
      // Zig right or left.
      if (p._L === x) rightRotate(tree, p); else leftRotate(tree, p);
    } else {
      if (p._L === x && g._L === p) {
        // Zig-zig right.
        rightRotate(tree, g);
        rightRotate(tree, p);
      } else if (p._R === x && g._R === p) {
        // Zig-zig left.
        leftRotate(tree, g);
        leftRotate(tree, p);
      } else if (p._L === x && g._R === p) {
        // Zig-zag right-left.
        rightRotate(tree, p);
        leftRotate(tree, g);
      } else {
        // Zig-zag left-right.
        leftRotate(tree, p);
        rightRotate(tree, g);
      }
      reorder(tree, g);
    }
    reorder(tree, p);
  }
  reorder(tree, x);
}

function findByOrder(tree, key, value) {
  var x = tree._root;
  while (x !== null) {
    var L = x._L, R = x._R, leftval, rightval;
    if (L !== null) {
      leftval = L[key];
      if (value < leftval) {
        x = L;
        continue;
      }
    }
    rightval = x[key];
    if (R !== null) {
      rightval -= R[key];
    }
    if (value < rightval) {
      return x;
    }
    value -= rightval;
    x = R;
  }
  return null;
}

// Global temporary object to avoid allocation.
var globalStub = new Location();

// Splays to root the leftmost node whose order statistic is greater than
// the given value.  For example, ("count", 0, true) will splay to the root
// the leftmost node that has a positive count.  Adapted from:
// https://github.com/montagejs/collections/blob/master/sorted-set.js
// This is the simplified top-down splaying algorithm from: "Self-adjusting
// Binary Search Trees" by Sleator and Tarjan.
function splayByOrder(tree, key, value) {
  var stub, left, right, temp, root, L, R, history, rootsum, found,
      sidesum, sssum;
  if (!tree._root) {
    return false;
  }
  // Create a stub node.  The use of the stub node is a bit
  // counter-intuitive: The right child of the stub node will hold the L tree
  // of the algorithm.  The left child of the stub node will hold the R tree
  // of the algorithm.  Using a stub node, left and right will always be
  // nodes and we avoid special cases.
  // - http://code.google.com/p/v8/source/browse/branches
  //       /bleeding_edge/src/splay-tree-inl.h
  stub = left = right = globalStub;
  root = tree._root;
  rootsum = root[key];
  while (true) {
    L = root._L;
    if (L !== null) {
      sidesum = L[key];
      if (value < sidesum) {
        if (L._L !== null && value < (sssum = L._L[key])) {
          rightRootedRotate(root);
          reorder(tree, root);
          root = L;
          rootsum = sssum;
        } else {
          rootsum = sidesum;
        }
        // link left
        right._L = root;
        root._P = right;
        // right order statistics and right._L are invalid: don't update.
        right = root;
        root = root._L; // Don't null root._P until the end.
        continue;
      }
    }
    R = root._R;
    rootsum = root[key];
    if (R !== null) {
      sidesum = R[key];
      if (value >= rootsum - sidesum) {
        if (R._R !== null && value >= rootsum - (sssum = R._R[key])) {
          leftRootedRotate(root);
          reorder(tree, root);
          root = R;
          value = value - rootsum + sssum;
          rootsum = sssum;
        } else {
          value = value - rootsum + sidesum;
          rootsum = sidesum;
        }
        // link right
        left._R = root;
        root._P = left;
        // left order statistics and left._R are invalid: don't update.
        left = root;
        root = root._R; // Don't null root._P until the end.
        continue;
      } else {
        found = true;
        break;
      }
    } else {
      found = value < rootsum;
    }
    break;
  }
  // reassemble
  root._P = null;
  left._R = root._L;
  if (left._R !== null) left._R._P = left;
  right._L = root._R;
  if (right._L !== null) right._L._P = right;
  root._L = stub._R;
  if (root._L !== null) root._L._P = root;
  root._R = stub._L;
  if (root._R !== null) root._R._P = root;
  // propagate new order statistics
  if (right !== stub) while (right !== null) {
    reorder(tree, right);
    right = right._P;
  }
  if (left !== stub) while (left !== null) {
    reorder(tree, left);
    left = left._P;
  }
  reorder(tree, root);
  tree._root = root;
  return found;
}

function first(tree) {
  var seek = tree._root, prev = null;
  while (seek !== null) {
    prev = seek;
    seek = prev._L;
  }
  return prev
}

function last(tree) {
  var seek = tree._root, prev = null;
  while (seek !== null) {
    prev = seek;
    seek = prev._R;
  }
  return prev
}

function forward(loc, count, key) {
  key = key || 'n';
  var next = loc, R = next._R, rightsum;
  if (R !== null) { rightsum = R[key]; }
  while (count > 0) {
    if (R !== null) {
      next = R;
      if (rightsum < count) {
        count -= treesum;
      } else {
        for (loc = next._L; loc != null; loc = next._L) {
          if (loc[key] < count) {
            break;
          }
          next = loc;
        }
      }
    } else {
      for (loc = next, next = loc._P; next != null && next._R === loc;) {
        loc = next;
        next = loc._P;
      }
      if (next === null) break;
      count += loc[key];
    }
    R = next._R;
    if (R !== null) { count += (rightsum = next._R[key]); }
    count -= next[key];
  }
  return next;
}

function removeRange(tree, first, limit) {
  if (limit == null) {
    splayUp(tree, first);
    //       first                   L
    //       /  \
    //      L   DELETE
    tree._root = first._L;
    if (tree._root !== null) tree._root._P = null;
    first._L = null;
  } else {
    splayUp(tree, first);
    if (limit === first) return false;
    splayUp(tree, limit);
    if (limit._L !== first) {
      // first does not come before limit in the tree.
      if (limit._L === null || limit._L._L !== first) return false;
    }
    // Or first is two levels down due to a zig-zig.
    //          limit                 limit
    //          /   \                 /   \
    //        XX     R     ->        LL    R
    //       /  \
    //    first  YY
    //    /   \
    //   LL   ZZ
    // Single-level down case.
    //          limit               limit
    //          /   \               /   \
    //       first   R             L     R
    //       /  \
    //      L   DELETE
    limit._L._P = null;
    limit._L = first._L;
    if (limit._L !== null) limit._L._P = limit;
    first._L = null;
    reorder(tree, limit);
  }
  return true;
}

function dump(out, node, depth) {
  if (!node) {
    out("null");
    return;
  }
  var result = "";
  if (node._R !== null) {
    result += dump(out, node._R, depth + 1);
  }
  var line = node.toString(),
      prev = node, scan = prev._P, j = depth, rchild, rparent;
  if (scan === null) {
    line = '\u2501' + line;
  } else {
    rchild = (scan._R === prev);
    if (rchild) {
      line = '\u250c\u2574' + line;
    } else {
      line = '\u2514\u2574' + line;
    }
    prev = scan;
    scan = prev._P;
    rparent = rchild;
    while (scan !== null && j > 0) {
      rchild = (scan._R === prev);
      if (rchild === rparent) {
        line = '  ' + line;
      } else {
        line = '\u2502 ' + line;
      }
      prev = scan;
      scan = prev._P;
      j -= 1;
      rparent = rchild;
    }
    line = ' ' + line;
  }
  out(line);
  if (node._L !== null) {
    result += dump(out, node._L, depth + 1);
  }
}

var SplayList = function(orderstats) {
  this._root = null;
  if (orderstats) {
    this.orderstats = orderstats;
  }
};

SplayList.prototype = {

constructor: SplayList,

orderstats: function(V, X, L, R) {
  // Override orderstats to add more order statistics.
  // Example:
  // x = new SplayList();
  // x.orderstats = function(V, X, L, R) {
  //   var n = 1, len = V.length;
  //   if (L !== null) { n += L.n; len += L.length; }
  //   if (R !== null) { n += R.n; len += R.length; }
  //   X.n = n; X.length = len;
  // });
  var v = 1;
  if (L !== null) v += L.n;
  if (R !== null) v += R.n;
  X.n = v;
},

each: function(fn) {
  var loc = first(this);
  while (loc !== null) {
    fn(loc);
    loc = loc.next();
  }
},

nth: function(index) {
  return this.find('n', index);
},

get: function(loc) {
  loc = this.nth(loc);
  if (loc !== null) return loc.val();
},

set: function(loc, value) {
  if (typeof(loc) === 'number') {
    loc = this.nth(index);
    if (loc === null) return;
  } else {
    if (loc === null) return;
    splayUp(this, loc);
  }
  loc._V = value;
  reorder(this, loc);
},

find: function(key, value) {
  /*
  if (null !== (loc = findByOrder(this, key, value))) splayUp(this, loc);
  return loc;
  */
  if (!splayByOrder(this, key, value)) return null;
  return this._root;
},

index: function(location) {
  splayUp(this, location);
  if (location._L === null) return 0;
  return location._L.n;
},

stat: function(key, location) {
  var left;
  if (location == null) {
    left = this._root;
  } else {
    splayUp(this, location);
    left = location._L;
  }
  if (left === null) return 0;
  return left[key];
},

unshift: function(value) {
  if (arguments.length !== 1) {
    if (arguments.length > 1) {
      this.spliceArray(0, 0, arguments);
    }
  } else {
    var root = new Location(value);
    root._R = this._root;
    if (root._R !== null) root._R._P = root;
    reorder(this, root);
    this._root = root;
  }
  return this.length;
},

push: function(value) {
  if (arguments.length !== 1) {
    if (arguments.length > 1) {
      this.spliceArray(null, 0, arguments);
    }
  } else {
    var root = new Location(value);
    root._L = this._root;
    if (root._L !== null) root._L._P = root;
    reorder(this, root);
    this._root = root;
  }
  return this.length;
},

shift: function() {
  var first = this.first();
  if (first !== null) {
    this.removeAt(first);
    return first.val();
  }
},

pop: function() {
  var last = this.last();
  if (last !== null) {
    this.removeAt(last);
    return last.val();
  }
},

insertAfter: function(location, value) {
  if (location === null) { return this.unshift(value); }
  splayUp(this, location);
  var oldroot = this._root;
  var root = new Location(value);
  root._L = oldroot;
  if (oldroot !== null) {
    oldroot._P = root;
    root._R = oldroot._R;
    if (root._R) root._R.P = root;
    oldroot._R = null;
    reorder(this, oldroot);
  }
  reorder(this, root);
  this._root = root;
  return root;
},

insertBefore: function(location, value) {
  if (location === null) { return this.push(value); }
  splayUp(this, location);
  var oldroot = this._root;
  var root = new Location(value);
  root._R = oldroot;
  if (oldroot !== null) {
    oldroot._P = root;
    root._L = oldroot._L;
    if (root._L) root._L.P = root;
    oldroot._L = null;
    reorder(this, oldroot);
  }
  reorder(this, root);
  this._root = root;
  return root;
},

removeAt: function(location) {
  if (typeof(location) === 'number') {
    location = this.nth(location);
  } else {
    splayUp(this, location);
  }
  if (location._R === null) {
    // assert.equal(this._root, location);
    this._root = location._L;
    this._root._P = null;
  } else if (location._L === null) {
    this._root = location._R;
    this._root._P = null;
  } else {
    splayUp(this, this._root.next());
    // assert.equal(this._root._L, location);
    // assert.equal(location._R, null);
    //         sucessor           successor
    //          /   \               /   \
    //       DELETE  R             L     R
    //       /
    //      L
    this._root._L = location._L
    location._L = location._P = null;
    if (this._root._L) this._root._L._P = this._root._L;
    reorder(this, this._root);
  }
},

removeRange: function(first, limit) {
  if (typeof(first) === 'number') {
    first = this.nth(first);
  }
  if (first == null) {
    limit = null;
  } else {
    if (typeof(limit) === 'number') {
      limit = forward(first, limit);
    }
    removeRange(this, first, limit);
  }
},

spliceList: function(first, limit, insert) {
  var result = new SplayList(), root, last, prev;
  if (typeof(first) === 'number') {
    first = this.nth(first);
  }
  if (first == null) {
    limit = null;
  } else {
    if (typeof(limit) === 'number') {
      limit = forward(first, limit);
    }
    if (removeRange(this, first, limit)) {
      // Assemble spliced out return result.
      if (first._P !== null) {
        // One-level-down case.
        result._root = first._P;
      } else {
        // At-root case.
        result._root = first;
      }
      reorder(result, first);
      if (first._P !== null) {
        reorder(result, result._root);
      }
    }
  }
  if (insert != null && insert._root !== null) {
    if (limit == null) {
      //  (this)}      (insert)         (this)
      //                limit            limit
      //    L    +        \      ->      /  \
      //                   T            L    T
      splayUp(insert, (limit = insert.first()));
      limit._L = this._root;
      if (limit._L !== null) limit._L._P = limit;
      this._root = limit;
    } else if (limit._L === null) {
      //    (this)      (insert)          (this)
      //    limit                         limit
      //        \    +      T     ->      /   \
      //         R                       T     R
      limit._L = insert._root;
      limit._L._P = limit;
    } else {
      //    (this)      (insert)          (this)
      //    limit         root            limit
      //    /   \    +       \    ->      /   \
      //   L     R            T        root    R
      //                                /  \
      //                               L    T
      splayUp(insert, (root = insert.first()));
      root._L = limit._L;
      root._L._P = root;
      limit._L = root;
      root._P = limit;
      reorder(this, root);
    }
    reorder(this, limit);
    insert._root = null;
  }
  return result;
},

toArray: function(loc, count) {
  var result = [];
  if (count == null) count = Infinity;
  if (!loc) loc = this.first();
  if (typeof(loc) === 'number') {
    loc = this.nth(loc);
  }
  while (result.length < count && loc !== null) {
    result.push(loc.val());
    loc = loc.next();
  }
  return result;
},

splice: function(loc, count) {
  var values = Array.prototype.splice.call(arguments, 2);
  return this.spliceArray(loc, count, values);
},

spliceArray: function(loc, count, values) {
  var after, left, j, len, loc, result = [], numeric;
  if (count == null) count = Infinity;
  numeric = typeof(count) === 'number';
  if (loc === 0) loc = this.first();
  else if (typeof(loc) === 'number') {
    loc = this.nth(loc);
  }
  if (loc !== null && (!numeric || count > 0)) {
    after = loc;
    while (after !== null) {
      if (numeric ? result.length >= count : after == count) break;
      result.push(after.val());
      after = after.next();
    }
    if (!numeric && after != count) {
      result = [];
      after = loc;
      splayUp(this, after);
    } else {
      removeRange(this, loc, after);
    }
  } else {
    after = loc;
    if (after !== null) {
      splayUp(this, after);
    }
  }
  if (values.length === 0) return result;
  j = values.length - 1;
  loc = new Location(values[j]);
  while (--j >= 0) {
    sub = loc;
    loc = new Location(values[j]);
    loc._R = sub;
    sub._P = loc;
    reorder(this, sub);
  }
  //   after                after
  //   /   \                /   \
  // left   T     ->    loc=[0]  T
  //                      / \
  //                  left  [1]
  //                          \
  //                           ...
  left = after === null ? this._root : after._L;
  if (left !== null) {
    loc._L = left;
    left._P = loc;
  }
  reorder(this, loc);
  if (after !== null) {
    after._L = loc;
    loc._P = after;
    this._root = after;
    reorder(this, after);
  } else {
    this._root = loc;
  }
  return result;
},

first: function() { return first(this); },

last: function() { return last(this); },

get length() {
  if (this._root === null) return 0;
  return this._root.n;
},

toString: function(out) {
  var result = null;
  if ('function' != typeof(out)) {
    result = [];
    out = function(s) { result.push(s); result.push('\n'); }
  }
  dump(out, this._root, 0);
  if (result) {
    return result.join('');
  }
}

};

// Simplify subclassing, for example, for overriding orderstats.
var extend = function(proto) {
  var Baseclass = this,
      Subclass = function() { return Baseclass.apply(this, arguments); },
      k;
  Subclass.prototype = Object.create(Baseclass.prototype);
  for (k in proto) if (proto.hasOwnProperty(k)) {
    Subclass.prototype[k] = proto[k];
  }
  Subclass.prototype.constructor = Subclass;
  for (k in Baseclass) if (Baseclass.hasOwnProperty(k)) {
    Subclass[k] = Baseclass[k];
  }
  return Subclass;
};

SplayList.extend = extend;
SplayList.Location = Location;
exports.SplayList = SplayList;

})(
  (typeof module) === 'object' && module.exports || window
);
