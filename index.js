let binSearch = require('binary-search')

module.exports = SortedArrayMap
let pro = SortedArrayMap.prototype

function SortedArrayMap (map, cmp) {
  if (!(this instanceof SortedArrayMap)) {
    return new SortedArrayMap(map, cmp)
  }

  // allow arguments to be passed in in any order
  if (typeof map === 'function') {
    let x = cmp
    cmp = map
    map = x
  }

  this.keyMap = {}
  this.items = []
  this.cmp = (typeof cmp === 'function') ? cmp : defaultCmp

  map = map || []
  // add all elements sorted
  this.addFromMap(map)
}

/*
 * Add item to the array
 * accepts multiple arguments
 *
 * returns the index of the first item inserted
 */
pro.add = pro.push = function () {
  let firstIndex
  let arr = arguments
  let len = arr.length - 1
  for (let i = 0; i < len;) {
    let key = arr[i++]
    let val = arr[i++]
    firstIndex = this.addOne(key, val)
  }
  return firstIndex
}

/*
 * Add items from an unsorted map
 * (Note: #add() uses this method with it's arguments object)
 *
 * returns the index of the first item inserted
 */
pro.addFromMap = function (map) {
  let firstIndex
  for (let key in map) {
    firstIndex = this.addOne(key, map[key])
  }
  return firstIndex
}

/*
 * Adds a single item into the array
 *
 * returns the index of the item that was inserted
 */
pro.addOne = function (key, val) {
  if (this.keyMap[key]) {
    // key is already existed
    return -1
  }
  this.keyMap[key] = val

  let idx = this.indexOf(key)
  let x = idx < 0 ? -idx - 1 : idx
  this.items.splice(x, 0, {key, val})
  return x
}

/*
 * returns a string summary of contents
 */
pro.toString = function (value) {
  let contents = this.items.length > 0 ? '[' + this.items.toString() + ']' : 'empty'
  return '{' + this.constructor.name + ' ' + contents + '}'
}

/*
 * Gets an item by index from the array
 */
pro.get = function (idx) {
  let item = this.items[idx]
  return item ? item.val : item
}

pro.getKey = function (idx) {
  let item = this.items[idx]
  return item ? item.key : item
}

/*
 * Removes an item by key from the array
 *
 * returns the item that was removed, or undefined if
 * not found
 */
pro.remove = function (key) {
  let idx = this.indexOf(key)
  if (idx < 0) return
  return this.removeAtIndex(idx)
}

/*
 * Removes an item at an index
 *
 * returns an array of the items that were found or undefined if
 * nothing was found. (Default behavior of splice removal)
 */
pro.removeAtIndex = function (idx) {
  let item = this.items.splice(idx, 1)[0]
  if (item) {
    delete this.keyMap[item.key]
  }
}

/*
 * Checks for the presence of a value in the array
 *
 * Returns true if it was found, false if not
 */
pro.contains = function (key) {
  return !!this.keyMap[key]
}

/*
 * Checks for the presence of all values in an array
 *
 * Returns true if they were all found, false if not
 */
pro.containsAll = function (arr) {
  for (let i = 0, l = arr.length; i < l; i++) {
    if (!this.contains(arr[i])) return false
  }
  return true
}

/*
 * Does a binary search for the particular item.
 *
 * Returns the index if the item is found, if not, the index of the item
 * that is the closest match + 1 will be returned as a minus value (that
 * is decided by the binary-search module)
 */
pro.indexOf = function (key) {
  if (!this.keyMap[key]) { return -1 }
  return binSearch(this.items, {key, val: this.keyMap[key]}, cmpFunc.bind(this))
}

/*
 * equivalent of Array#map
 */
pro.map = function (func) {
  return Array.prototype.map.call(this.items, function (item, index) {
    func(item.val, item.key, index, this)
  })
}

/*
 * equivalent of Array#filter
 */
pro.filter = function (func) {
  return Array.prototype.filter.call(this.items, function (item, index) {
    func(item.val, item.key, index, this)
  })
}

/*
 * equivalent of Array#forEach
 */
pro.forEach = function (func) {
  return Array.prototype.forEach.call(this.items, function (item, index) {
    func(item.val, item.key, index, this)
  })
}

/*
 * equivalent of Array#pop
 */
pro.pop = function () {
  let item = Array.prototype.pop.apply(this.items, arguments)
  if (item) {
    delete this.keyMap[item.key]
  }
  return item
}

/*
 * equivalent of Array#shift
 */
pro.shift = function () {
  let item = Array.prototype.shift.apply(this.items, arguments)
  if (item) {
    delete this.keyMap[item.key]
  }
  return item
}

/*
 * Get the size of the array
 *
 * returns an integer
 */
pro.size = pro.length = function () {
  return this.items.length
}

/*
 * Export a copy of the internal array.
 *
 * returns an array
 */
pro.toArray = function () {
  return this.items.slice(0)
}

function defaultCmp (a, b) {
  return a - b
}

function cmpFunc (a, b) {
  return this.cmp(a.val, b.val)
}
