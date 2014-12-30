(function(exports) {

var Location = function() {
  this._P = null;
  this._L = null;
  this._R = null;
}

Location.prototype = {
  val: function() { return this._V; }
}

function newloc(value) {
  var loc = new Location();
  loc._V = value;
  return loc;
}

function reorder(x) {
  var L = x._L, R = x._R, V = x._V, v = 1;
  if (L !== null) v += L.n;
  if (R !== null) v += R.n;
  x.n = v;
  if (this._stats) {
    for (var j = 0; j < this._stats.length; ++j) {
      var key = this._stats[j];
      v = V[key];
      if (L !== null) v += L[key];
      if (R !== null) v += R[key];
      x[key] = v;
    }
  }
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
  y._P = x._P;
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
  y._P = x._P;
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
      tree.reorder(g);
    }
    tree.reorder(p);
  }
  tree.reorder(x);
}

function findByOrder(tree, stat, value) {
  var x = tree._root;
  while (x !== null) {
    var L = x._L, R = x._R, V = x._V, leftval;
    if (L) {
      leftval = L[key];
      if (value < leftval) {
        x = L;
        continue;
      }
      value -= leftval;
    }
    leftval = key === 'n' ? 1 : V[key];
    if (value < leftval) {
      return x;
    }
    value -= leftval;
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
  var stub, left, right, temp, root, L, R, history, leftsum, rootval, found;
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
  while (true) {
    L = root._L;
    if (L !== null) {
      leftsum = L[key];
      if (value < leftsum) {
        if (L._L !== null && value < L._L[key]) {
          rightRootedRotate(root);
          tree.reorder(root);
          root = L;
        }
        // link left
        right._L = root;
        root._P = right;
        // right order statistics and right._L are invalid: don't update.
        right = root;
        root = root._L;
        root._P = null;
        continue;
      }
      value -= leftsum;
    }
    rootval = key === 'n' ? 1 : root._V[key];
    if (value < rootval) {
      // Found the value at root, or ran off the left edge.
      found = true;
      break;
    }
    R = root._R;
    if (R !== null) {
      value -= rootval;
      leftsum = key === 'n' ? 1 : R._V[key];
      if (R._L !== null) {
        leftsum += R._L[key];
      }
      if (R._R !== null && value >= leftsum) {
        leftRootedRotate(root);
        tree.reorder(root);
        root = R;
        value -= leftsum;
      }
      // link right
      left._R = root;
      root._P = left;
      // left order statistics and left._R are invalid: don't update.
      left = root;
      root = root._R;
      root._P = null;
      continue;
    }
    // Ran off the right edge.
    found = false;
    break;
  }
  // reassemble
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
    tree.reorder(right);
    right = right._P;
  }
  if (left !== stub) while (left !== null) {
    tree.reorder(left);
    left = left._P;
  }
  tree.reorder(root);
  tree._root = root;
  return found;
};

function successor(loc) {
  var next = loc._R;
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
}

function first(tree) {
  var seek = tree._root, prev = null;
  while (seek !== null) {
    prev = seek;
    seek = prev._L;
  }
  return prev
}

function predecessor(loc) {
  var prev = loc._L;
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
}

function shortjson(n) {
  return JSON.stringify(n).replace(/"(\w+)":/g, "$1:");
}

function dumpnode(node, stats) {
  var total = {}, cur = {}, str = '' + node._V, k, j;
  if (stats) {
    for (j = 0; j < stats.length; ++j) {
      k = stats[j];
      total[k] = node[k];
      cur[k] = node._V[k];
    }
    str += ' T' + shortjson(total) + ' ' + shortjson(cur);
  }
  str += ' (' + node.n + ')';
  return str;
}

function dump(tree, out, node, depth) {
  if (!node) {
    out("null");
    return;
  }
  depth = depth || 0;
  var result = "";
  if (node._R !== null) {
    result += dump(tree, out, node._R, depth + 1);
  }
  var line = dumpnode(node, tree._stats),
      prev = node, scan = prev._P, j = depth, rchild, rparent;
  if (scan == null) {
    line = '\u2192' + line;
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
    result += dump(tree, out, node._L, depth + 1);
  }
}

var globalOne = { n: 1 };

var SplayTree = function(stats) {
  this._root = null;
  this._stats = stats;
};

SplayTree.prototype = {

each: function(fn) {
  var loc = first(this);
  while (loc !== null) {
    fn(loc);
    loc = successor(loc);
  }
},

nth: function(index) {
  return this.find('n', index);
},

find: function(key, value) {
  /*
  var loc = findByOrder(this, key, value);
  if (loc === null) return null;
  splayUp(this, loc);
  return loc;
  */
  if (!splayByOrder(this, key, value)) return null;
  return this._root;
},

index: function(location) {
  splayUp(this, location);
  if (location._L === null) return 0;
  return location._L.count;
},

stat: function(key, location) {
  var left = this._root;
  if (location != null) {
    splayUp(this, location);
    left = location._L;
  }
  if (left === null) return 0;
  return left[key];
},

prepend: function(value) {
  var root = newloc(value, this._orderstats);
  root._R = this._root;
  if (root._R !== null) root._R._P = root;
  this.reorder(root);
  this._root = root;
  return root;
},

append: function(value) {
  var root = newloc(value, this._orderstats);
  root._L = this._root;
  if (root._L !== null) root._L._P = root;
  this.reorder(root);
  this._root = root;
  return root;
},

insertAfter: function(location, value) {
  splayUp(this, location);
  var oldroot = this._root;
  var root = newloc(value, this._orderstats);
  root._L = oldroot;
  if (oldroot !== null) {
    oldroot._P = root;
    root._R = oldroot._R;
    if (root._R) root._R.P = root;
    oldroot._R = null;
    this.reorder(oldroot);
  }
  this.reorder(root);
  this._root = root;
  return root;
},

insertBefore: function(location, value) {
  splayUp(this, location);
  var oldroot = this._root;
  var root = newloc(value, this._orderstats);
  root._R = oldroot;
  if (oldroot !== null) {
    oldroot._P = root;
    root._L = oldroot._L;
    if (root._L) root._L.P = root;
    oldroot._L = null;
    this.reorder(oldroot);
  }
  this.reorder(root);
  this._root = root;
  return root;
},

remove: function(location) {
  splayUp(this, location);
  if (location._R === null) {
    // assert: this._root === location
    this._root = location._L;
  } else {
    splayUp(successor(this._root));
    // asssert: this._root._L === location
    // asseert: location._R === null
    this._root._L = location._L
    if (this._root._L) this._root._L._P = this._root._L;
    this.reorder(this._root);
  }
},

reorder: reorder,

first: function() { return first(this); },

next: successor,

prev: predecessor,

size: function() {
  if (this._root === null) return 0;
  return this._root.n;
},

dump: function(out) {
  if ('function' != typeof(out)) {
    out = function(s) { console.log(s); }
  }
  dump(this, out, this._root);
}

};

SplayTree.Location = Location;
exports.SplayTree = SplayTree;

})(
  (typeof module) == 'object' && module.exports || window
);
