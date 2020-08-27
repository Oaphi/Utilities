"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppendQueue = factory();
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  /**
   * @summary wrapper around promise of HTMLElement
   * @class
   */
  var AsyncAppendable =
  /**
   * @param {Promise<HTMLElement>} promise
            * @param {AsyncAppendQueue} queue
            * @param {function} callback
   * @param {number} [index]
   */
  function AsyncAppendable(promise, queue, callback) {
    var _this = this;

    var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, AsyncAppendable);

    this.promise = promise;
    this.index = index;
    this.queue = queue;
    this.callback = callback;
    promise.then(function (res) {
      var callback = _this.callback,
          index = _this.index;
      res.weight = index;
      var root = queue.root;
      var children = root.children;
      var length = children.length;

      if (!length) {
        root.append(res);
        callback && callback(res);
        return res;
      }

      elementsLeftUntil(root, function (elem) {
        return elem.weight < index;
      }, function (matched, idx) {
        return elementsRightUntil(root, idx, function (elem) {
          return elem.weight > index;
        }, function (elem) {
          return elem.before(res);
        }, function () {
          return matched.after(res);
        });
      }, function () {
        return elementsRightUntil(root, function (elem) {
          return elem.weight > index;
        }, function (matched, idx) {
          return elementsLeftUntil(root, idx, function (elem) {
            return elem.weight < index;
          }, function (elem) {
            return elem.after(res);
          }, function () {
            return matched.before(res);
          });
        });
      });
      callback && callback(res);
      return res;
    });
  };
  /**
   * @summary queue controller
   * @class
   */


  var AsyncAppendQueue = /*#__PURE__*/function () {
    /**
     * @param {HTMLElement} root 
     */
    function AsyncAppendQueue(root) {
      _classCallCheck(this, AsyncAppendQueue);

      /** @type {AsyncAppendable[]} */
      this.promises = [];
      this.root = root;
    }
    /**
     * @summary enqueues promise of HTMLElement
     * @param {Promise<HTMLElement>} promise 
     * @param {function} callback
     * @returns {AsyncAppendQueue}
     */


    _createClass(AsyncAppendQueue, [{
      key: "enqueue",
      value: function enqueue(promise, callback) {
        var promises = this.promises;
        var length = promises.length;
        var prepared = new AsyncAppendable(promise, this, callback, length);
        promises.push(prepared);
        return this;
      }
      /**
       * @summary clears promise queue
       * @returns {AsyncAppendQueue}
       */

    }, {
      key: "clear",
      value: function clear() {
        var promises = this.promises;
        promises.length = 0;
        return this;
      }
    }]);

    return AsyncAppendQueue;
  }();

  return AsyncAppendQueue;
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.elementsRightUntil = elementsRightUntil;
exports.elementsLeftUntil = elementsLeftUntil;
exports.removeLastChild = exports.listContainsSome = exports.emphasizeSelectedText = void 0;

/**
 * @typedef {object} EmphasisConfig
 * @property {HTMLInputElement} element
 * @property {("bold"|"italic"|"strike"|"underline")} type
 * 
 * @param {EmphasisConfig}
 * @returns {HTMLInputElement}
 */
var emphasizeSelectedText = function emphasizeSelectedText(_ref) {
  var element = _ref.element,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? "italic" : _ref$type;
  var emphasis = new Map([["italic", "em"], ["bold", "strong"], ["underline", "u"], ["strike", "s"]]);
  var tag = emphasis.get(type);

  if (!tag) {
    return element;
  }

  var selectionStart = element.selectionStart,
      selectionEnd = element.selectionEnd,
      value = element.value;
  var selected = value.slice(selectionStart, selectionEnd);
  element.value = value.replace(selected, "<".concat(tag, ">").concat(selected, "</").concat(tag, ">"));
  return element;
};
/**
 * @description traverses children left to right, calling comparator on each one
 * until it evaluates to true, then calls the callback with first element passing 
 * the condition or with root itself if none
 * @param {HTMLElement} root 
 * @param {number} [offset]
 * @param {function(HTMLElement): boolean} comparator 
 * @param {function(HTMLElement)} [callback] 
 * @param {function(HTMLElement)} [fallback]
 * @param {boolean} [strict]
 */


exports.emphasizeSelectedText = emphasizeSelectedText;

function elementsRightUntil(root, offset, comparator, callback, fallback) {
  var strict = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  if (typeof offset === "function") {
    fallback = callback;
    callback = comparator;
    comparator = offset;
    offset = 0;
  }

  if (typeof callback === "boolean") {
    strict = callback;
    callback = null;
  }

  if (typeof fallback === "boolean") {
    strict = fallback;
    fallback = null;
  }

  var current = root.children[offset] || (strict ? null : root);
  var matchedOnce = comparator(current) ? 1 : 0;
  var index = offset;

  if (!matchedOnce) {
    while (current.nextElementSibling) {
      index++;
      current = current.nextElementSibling;

      if (comparator(current)) {
        matchedOnce |= 1;
        break;
      }
    }
  }

  var use = matchedOnce ? callback : fallback;
  return use ? use(current, index) : current;
}
/**
 * @summary inverse of elementsRightUntil
 * @param {HTMLElement} root
 * @param {number} [offset]
 * @param {function(HTMLElement): boolean} comparator
 * @param {function(HTMLElement)} [callback]
 * @param {function(HTMLElement)} [fallback]
 * @param {boolean} [strict]
 */


function elementsLeftUntil(root, offset, comparator, callback, fallback) {
  var strict = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

  if (typeof offset === "function") {
    fallback = callback;
    callback = comparator;
    comparator = offset;
    offset = 0;
  }

  if (typeof callback === "boolean") {
    strict = callback;
    callback = null;
  }

  if (typeof fallback === "boolean") {
    strict = fallback;
    fallback = null;
  }

  var children = root.children;
  var lastIndex = children.length - 1 - offset;
  var current = children[lastIndex] || (strict ? null : root);
  var matchedOnce = comparator(current) ? 1 : 0;
  var index = lastIndex;

  if (!matchedOnce) {
    while (current.previousElementSibling) {
      index--;
      current = current.previousElementSibling;

      if (comparator(current)) {
        matchedOnce |= 1;
        break;
      }
    }
  }

  var use = matchedOnce ? callback : fallback;
  return use ? use(current, index) : current;
}
/**
 * @summary checks if some tokens are contained
 * @param {DOMTokenList} list
 */


var listContainsSome = function listContainsSome(list) {
  return (
    /**
     * @param {...string} [tokens]
     * @returns {boolean}
     */
    function () {
      var boundContains = list.contains.bind(list);

      for (var _len = arguments.length, tokens = new Array(_len), _key = 0; _key < _len; _key++) {
        tokens[_key] = arguments[_key];
      }

      return tokens.some(boundContains);
    }
  );
};
/**
 * @summary removes last child of Element
 * @param {Element} element
 * @returns {void}
 */


exports.listContainsSome = listContainsSome;

var removeLastChild = function removeLastChild(element) {
  return element.lastChild && element.lastChild.remove();
};

exports.removeLastChild = removeLastChild;
"use strict";
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONtoQuery = JSONtoQuery;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * @summary recursive parser
 * @param {string[]} order
 * @param {[string, any][]} entries 
 * @param {boolean} encode
 * @param {string} seq
 * @returns {string}
 */
var deep = function deep(order, entries, encode, seq) {
  return entries.map(function (entry) {
    var _entry = _slicedToArray(entry, 2),
        key = _entry[0],
        value = _entry[1];

    var seqOrSingleKey = "".concat(seq ? "".concat(seq, "[").concat(key, "]") : key);

    if (value === null) {
      return;
    }

    if (_typeof(value) === "object") {
      return deep(order, Object.entries(value), encode, seqOrSingleKey);
    }

    if (value !== undefined) {
      var encoded = encode ? encodeURIComponent(value) : value;
      return "".concat(seqOrSingleKey, "=").concat(encoded);
    }
  }).filter(function (val) {
    return val !== undefined;
  }).join("&");
};
/**
 * @typedef {object} JSONtoQueryConfig
 * @property {boolean} [encodeParams=false]
 * @property {string[]} [paramOrder=[]]
 * 
 * @summary converts object to query
 * @param {object} json parameters
 * @param {JSONtoQueryConfig}
 * @returns {string} query string
 */


function JSONtoQuery(json) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    encodeParams: false,
    paramOrder: []
  },
      encodeParams = _ref.encodeParams,
      _ref$paramOrder = _ref.paramOrder,
      paramOrder = _ref$paramOrder === void 0 ? [] : _ref$paramOrder;

  var ordered = [];
  Object.entries(json).forEach(function (entry) {
    var _entry2 = _slicedToArray(entry, 1),
        key = _entry2[0];

    var orderIndex = paramOrder.indexOf(key);

    if (orderIndex > -1) {
      ordered[orderIndex] = entry;
      return;
    }

    ordered.push(entry);
  });
  return deep(paramOrder, ordered, encodeParams);
}
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * @fileoverview Array utilities
 * @author Oleg Valter
 * @module
 */

/**
 * @typedef {object} ChunkifyConfig
 * @property {number} [size]
 * @property {number[]} [limits]
 * 
 * @summary splits an array into chunks
 * @param {any[]} source 
 * @param {ChunkifyConfig}
 * @returns {any[][]}
 */
var chunkify = function chunkify(source) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$limits = _ref.limits,
      limits = _ref$limits === void 0 ? [] : _ref$limits,
      size = _ref.size;

  var output = [];

  if (size) {
    var _length = source.length;
    var maxNumChunks = Math.ceil((_length || 1) / size);
    var numChunksLeft = maxNumChunks;

    while (numChunksLeft) {
      var chunksProcessed = maxNumChunks - numChunksLeft;
      var elemsProcessed = chunksProcessed * size;
      output.push(source.slice(elemsProcessed, elemsProcessed + size));
      numChunksLeft--;
    }

    return output;
  }

  var length = limits.length;

  if (!length) {
    return [Object.assign([], source)];
  }

  var lastSlicedElem = 0;
  limits.forEach(function (limit, i) {
    var limitPosition = lastSlicedElem + limit;
    output[i] = source.slice(lastSlicedElem, limitPosition);
    lastSlicedElem = limitPosition;
  });
  var lastChunk = source.slice(lastSlicedElem);
  lastChunk.length && output.push(lastChunk);
  return output;
};
/**
 * Combines filter() and map() in O(n)
 * @param {any[]} [array]
 * @returns {function(function):function(function):any[]}
 */


var filterMap = function filterMap() {
  var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return function () {
    var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (e) {
      return true;
    };
    return function () {
      var mapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (e) {
        return e;
      };
      var mappedArr = [];
      var initialIndex = 0,
          filteredIndex = 0;

      var _iterator = _createForOfIteratorHelper(array),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var elem = _step.value;
          filter(elem, initialIndex++) && mappedArr.push(mapper(elem, filteredIndex++));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return mappedArr;
    };
  };
};
/**
 * Combines filter() and map() in reverse in O(n)
 * @param {any[]} [array] 
 * @returns {function(function):function(function):any[]}
 */


var filterMapped = function filterMapped() {
  var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return function () {
    var mapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (e) {
      return e;
    };
    return function () {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (e) {
        return true;
      };
      var filteredArr = [];
      var initialIndex = 0,
          filteredIndex = 0;

      var _iterator2 = _createForOfIteratorHelper(array),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var elem = _step2.value;
          var mappedElem = mapper(elem, initialIndex++);
          filter(mappedElem, filteredIndex++) && filteredArr.push(mappedElem);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      return filteredArr;
    };
  };
};
/**
 * @summary returns last element of array
 * @param {any[]} array
 * @returns {any} 
 */


var last = function last(array) {
  return array[array.length - 1];
};
/**
 * Executes a callback for each element
 * (same as forEach, but in FP style + faster)
 * @param {any[]} [array]
 * @returns {function(function):void} 
 */


var forAll = function forAll() {
  var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return function (callback) {
    var index = 0;

    var _iterator3 = _createForOfIteratorHelper(array),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var elem = _step3.value;
        callback(elem, index++);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    return;
  };
};
/**
 * Maps array to values of 
 * property by key
 * @param {any[]} [array] 
 * @returns {function(string):any[]}
 */


var keyMap = function keyMap() {
  var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return function (key) {
    return !key ? array : array.map(function (elem) {
      return elem[key];
    });
  };
};
/**
 * @summary merges arrays
 * @param {any[]} source 
 * @param  {...any[]} [targets]
 * @returns {any[]}
 */


var mergeOnto = function mergeOnto(source) {
  var output = [];

  for (var _len = arguments.length, targets = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    targets[_key - 1] = arguments[_key];
  }

  for (var index = 0; index < source.length; index++) {
    var item = source[index];

    if (typeof item === "undefined") {
      var finalValue = item;

      var _iterator4 = _createForOfIteratorHelper(targets),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var target = _step4.value;
          finalValue = target[index];
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      output.push(finalValue);
      continue;
    }

    output.push(item);
  }

  return output;
};
/**
 * @typedef {object} StepReduceConfig
 * @property {any[]} source
 * @property {function(any,any,number?,any[]?) : any} callback
 * @property {number} [step]
 * @property {any} [initial]
 * 
 * @param {StepReduceConfig}
 */


var reduceWithStep = function reduceWithStep(_ref2) {
  var _ref2$source = _ref2.source,
      source = _ref2$source === void 0 ? [] : _ref2$source,
      callback = _ref2.callback,
      _ref2$step = _ref2.step,
      step = _ref2$step === void 0 ? 1 : _ref2$step,
      initial = _ref2.initial;
  return source.reduce(function (acc, curr, i) {
    return i % step ? acc : callback(acc, curr, i + step - 1, source);
  }, initial || source[0]);
};
/**
 * @typedef {object} ShrinkConfig
 * @property {any[][]} [source]
 * @property {{ 
 *  top : number, 
 *  right : number, 
 *  bottom : number, 
 *  left : number 
 * }} [leave]
 * @property {number} [left]
 * @property {number} [right]
 * @property {number} [bottom]
 * @property {number} [horizontally]
 * @property {number} [top]
 * @property {number} [vertically]
 * 
 * @summary shirnks a grid
 * @param {ShrinkConfig} [source]
 */


var shrinkGrid = function shrinkGrid() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref3$vertically = _ref3.vertically,
      vertically = _ref3$vertically === void 0 ? 0 : _ref3$vertically,
      source = _ref3.source,
      _ref3$top = _ref3.top,
      top = _ref3$top === void 0 ? 0 : _ref3$top,
      _ref3$right = _ref3.right,
      right = _ref3$right === void 0 ? 0 : _ref3$right,
      _ref3$left = _ref3.left,
      left = _ref3$left === void 0 ? 0 : _ref3$left,
      _ref3$leave = _ref3.leave,
      leave = _ref3$leave === void 0 ? {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  } : _ref3$leave,
      _ref3$horizontally = _ref3.horizontally,
      horizontally = _ref3$horizontally === void 0 ? 0 : _ref3$horizontally,
      _ref3$bottom = _ref3.bottom,
      bottom = _ref3$bottom === void 0 ? 0 : _ref3$bottom,
      _ref3$all = _ref3.all,
      all = _ref3$all === void 0 ? 0 : _ref3$all;

  if (!source || !source.length) {
    return [[]];
  }

  var _leave$top = leave.top,
      leaveTop = _leave$top === void 0 ? 0 : _leave$top,
      _leave$right = leave.right,
      leaveRight = _leave$right === void 0 ? 0 : _leave$right,
      _leave$bottom = leave.bottom,
      leaveBottom = _leave$bottom === void 0 ? 0 : _leave$bottom,
      _leave$left = leave.left,
      leaveLeft = _leave$left === void 0 ? 0 : _leave$left;

  if (horizontally) {
    left = right = Math.floor(horizontally / 2);
  }

  if (vertically) {
    top = bottom = Math.floor(vertically / 2);
  }

  var length = source.length;
  var topShift = length - (leaveBottom || length);
  var bottomShift = length - (leaveTop || length);
  return source.slice(all || top || topShift, (all || length) - (bottom || bottomShift)).map(function (row) {
    var length = row.length;
    var leftShift = length - (leaveRight || length);
    var rightShift = length - (leaveLeft || length);
    return row.slice(all || left || leftShift, (all || length) - (right || rightShift));
  });
};
/**
 * 
 * @param {any[]} source 
 * @param {...any[]} targets
 * @returns {any[]}
 */


var spliceInto = function spliceInto(source) {
  var output = source.map(function (item) {
    return item;
  }); //shallow copy;

  for (var _len2 = arguments.length, targets = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    targets[_key2 - 1] = arguments[_key2];
  }

  for (var _i = 0, _targets = targets; _i < _targets.length; _i++) {
    var target = _targets[_i];
    target.forEach(function (item, index) {
      if (typeof item !== "undefined") {
        output.splice(index, 0, item);
      }
    });
  }

  return output;
};
/**
 * @summary splits array in consequitive subsequences
 * @param {any[]} [source] 
 * @returns {any[][]}
 */


var splitIntoConseq = function splitIntoConseq() {
  var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var sequences = [],
      tails = [];
  var highestElem = -Infinity;
  source.forEach(function (element) {
    var precedeIndex = tails.indexOf(element + 1);
    var tailIndex = tails.indexOf(element - 1);

    if (tailIndex > -1) {
      sequences[tailIndex].push(element);
      tails[tailIndex] = element;
      return;
    }

    if (precedeIndex > -1) {
      sequences[precedeIndex].unshift(element);
      tails[precedeIndex] = element;
      return;
    }

    if (element > highestElem) {
      tails.push(element);
      sequences.push([element]);
      highestElem = element;
      return;
    }

    var spliceIndex = tails.findIndex(function (e) {
      return e < element;
    }) + 1;
    tails.splice(spliceIndex, 0, element);
    sequences.splice(spliceIndex, 0, [element]);
  });
  return sequences;
};
/**
 * @summary creates an object counter
 * @param {{
 *  onKey : string,
 *  source : object[]
 * }}
 */


var countObjects = function countObjects() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref4$source = _ref4.source,
      source = _ref4$source === void 0 ? [] : _ref4$source,
      onKey = _ref4.onKey;

  var validObjects = source.filter(Boolean);
  var length = validObjects.length;

  if (!length) {
    return {};
  }

  var validProp = onKey || Object.keys(validObjects[0])[0];
  var counter = {};
  validObjects.forEach(function (obj) {
    if (validProp in obj) {
      var val = obj[validProp];
      var inCount = counter[val] || 0;
      counter[val] = inCount + 1;
    }
  });
  return counter;
};
/**
 * @typedef {{
 *  keys : string[]
 * }} DedupeIgnore
 * 
 * @typedef {{
 *  ignore : DedupeIgnore,
 *  source : object[],
 *  type : ("entries"|"keys"|"values")
 * }} DedupeConfig
 * 
 * @summary deduplicates an array of objects
 * @param {DedupeConfig}
 * @returns {object[]}
 */


var deduplicate = function deduplicate() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref5$ignore = _ref5.ignore,
      ignore = _ref5$ignore === void 0 ? {} : _ref5$ignore,
      _ref5$source = _ref5.source,
      source = _ref5$source === void 0 ? [] : _ref5$source,
      _ref5$type = _ref5.type,
      type = _ref5$type === void 0 ? "entries" : _ref5$type;

  var toDedupe = source.map(function (obj) {
    return obj;
  }).reverse();
  var length = toDedupe.length;
  var _ignore$keys = ignore.keys,
      keys = _ignore$keys === void 0 ? [] : _ignore$keys;
  return source.filter(function (srcObj, srcIdx) {
    var srcEntries = Object.entries(srcObj).filter(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 1),
          k = _ref7[0];

      return !keys.includes(k);
    });
    var lastIdx = toDedupe.findIndex(function (tgtObj) {
      var tgtEntries = Object.entries(tgtObj).filter(function (_ref8) {
        var _ref9 = _slicedToArray(_ref8, 1),
            k = _ref9[0];

        return !keys.includes(k);
      });

      if (tgtEntries.length !== srcEntries.length) {
        return false;
      }

      var sameOnEntries = type === "entries" && tgtEntries.every(function (_ref10) {
        var _ref11 = _slicedToArray(_ref10, 2),
            key = _ref11[0],
            val = _ref11[1];

        return srcObj[key] === val;
      });
      var sameOnValues = type === "values" && tgtEntries.map(function (_ref12) {
        var _ref13 = _slicedToArray(_ref12, 2),
            v = _ref13[1];

        return v;
      }).every(function (tgtVal) {
        return Object.values(srcObj).includes(tgtVal);
      });
      var sameOnKeys = type === "keys" && tgtEntries.map(function (_ref14) {
        var _ref15 = _slicedToArray(_ref14, 1),
            k = _ref15[0];

        return k;
      }).every(function (tgtKey) {
        return Object.keys(srcObj).includes(tgtKey);
      });
      return sameOnEntries || sameOnValues || sameOnKeys;
    });
    return srcIdx === length - lastIdx - 1;
  });
};
/**
 * @typedef {{
 *  value : any,
 *  values : any[]
 * }} ClosestConfig
 * 
 * @summary finds closest value in the array
 * @param {ClosestConfig} [config]
 */


var closestValue = function closestValue() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!("value" in config)) {
    return null;
  }

  var value = config.value,
      _config$values = config.values,
      values = _config$values === void 0 ? [] : _config$values;

  if (!values.length) {
    return null;
  }

  var closestIndex = 0,
      currClosest = Math.abs(value - values[0]);
  values.forEach(function (val, i) {
    var diff = Math.abs(value - val);

    if (currClosest > diff) {
      closestIndex = i;
      currClosest = diff;
    }
  });
  return values[closestIndex];
};
/**
 * @summary removes elements from an array
 * @param {any[]} arr 
 * @param {...any} elems
 * @returns {any[]}
 */


var removeElements = function removeElements(arr) {
  for (var _len3 = arguments.length, elems = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    elems[_key3 - 1] = arguments[_key3];
  }

  return arr.filter(function (elem) {
    return !elems.includes(elem);
  });
};

var _default = {
  chunkify: chunkify,
  closestValue: closestValue,
  countObjects: countObjects,
  deduplicate: deduplicate,
  filterMap: filterMap,
  filterMapped: filterMapped,
  forAll: forAll,
  keyMap: keyMap,
  last: last,
  mergeOnto: mergeOnto,
  reduceWithStep: reduceWithStep,
  removeElements: removeElements,
  shrinkGrid: shrinkGrid,
  spliceInto: spliceInto,
  splitIntoConseq: splitIntoConseq
};
exports["default"] = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitAsync = exports.forEachAwait = exports.forAwait = void 0;

var _utilities = _interopRequireDefault(require("./utilities.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var noop = _utilities["default"].noop;
/**
 * @typedef {object} WaitConfig
 * @property {number} [ms = 1]
 * @property {function(number) : any} [callback]
 * 
 * @summary runs a callback after specified number of milliseconds and resolves
 * @param {WaitConfig} param0 
 * @returns {Promise<any>}
 */

var waitAsync = function waitAsync(_ref) {
  var _ref$ms = _ref.ms,
      ms = _ref$ms === void 0 ? 1 : _ref$ms,
      _ref$callback = _ref.callback,
      callback = _ref$callback === void 0 ? noop : _ref$callback;
  return new Promise(function (resolve) {
    var now = Date.now();
    setTimeout(function () {
      var newNow = Date.now();
      resolve(callback(newNow - now));
    }, ms);
  });
};
/**
 * @summary promise-based forEach preserving value and execution order
 * @param {any[]} source 
 * @param {function(any,number, any[]) : Promise<void>} asyncCallback
 * @returns {Promise<void>}
 */


exports.waitAsync = waitAsync;

var forAwait = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(source, asyncCallback) {
    var i, _iterator, _step, val;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            i = 0;
            _iterator = _createForOfIteratorHelper(source);
            _context.prev = 2;

            _iterator.s();

          case 4:
            if ((_step = _iterator.n()).done) {
              _context.next = 10;
              break;
            }

            val = _step.value;
            _context.next = 8;
            return asyncCallback(val, i++, source);

          case 8:
            _context.next = 4;
            break;

          case 10:
            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](2);

            _iterator.e(_context.t0);

          case 15:
            _context.prev = 15;

            _iterator.f();

            return _context.finish(15);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[2, 12, 15, 18]]);
  }));

  return function forAwait(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * @summary promise-based forEach preserving value order
 * @param {Promise<any>[]} array
 * @param {function(any,number, Promise<any>[]) : void} callback
 * @returns {void}
 */


exports.forAwait = forAwait;

var forEachAwait = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(source, callback) {
    var results;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Promise.all(source);

          case 2:
            results = _context2.sent;
            return _context2.abrupt("return", results.forEach(function (val, idx) {
              return callback(val, idx, source);
            }));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function forEachAwait(_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}();

exports.forEachAwait = forEachAwait;
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Emails = factory();
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  var Utilities = {};
  /**
   * @summary splits email address into domains
   * @param {string} email
   * @returns {string[]}
   */

  function smartEmailSplit(email) {
    var split = email.split('@') || [];

    var _split = _slicedToArray(split, 2),
        localPart = _split[0],
        internetDomain = _split[1];

    var partMatcher = /[!./+=%]/;
    var domains = internetDomain.split(partMatcher);
    var locals = localPart.split(partMatcher);
    domains.length > 1 && domains.pop();
    return locals.concat(domains).filter(Boolean).map(Utilities.toCase);
  }

  var registerCaseModifier = function registerCaseModifier(modifier) {
    if (typeof modifier === "function") {
      Utilities.toCase = modifier;
    }
  };

  return {
    smartEmailSplit: smartEmailSplit,
    registerCaseModifier: registerCaseModifier
  };
});
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.returnExports = factory();
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  /**
   * @summary defines a non-changeable property
   * @param {object} obj 
   * @param {string} key 
   * @param {any} val 
   * @param {boolean} [enumerable=true]
   * @returns {object}
   */
  var defineConstant = function defineConstant(obj, key, val) {
    var enumerable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    return Object.defineProperty(obj, key, {
      enumerable: enumerable,
      configurable: false,
      writable: false,
      value: val
    });
  };
  /**
   * @summary makes a Enum
   * @param {string[]} choices
   * @returns {object}
   */


  var makeEnum = function makeEnum(choices) {
    var length = choices.length;
    var enumerator = Object.create(null);
    var increment = 1,
        index = 0;

    var _iterator = _createForOfIteratorHelper(choices),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var choice = _step.value;
        defineConstant(enumerator, index, choice, false);
        defineConstant(enumerator, choice, increment);
        increment = increment << 1;
        index++;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    defineConstant(enumerator, "length", length, false);
    defineConstant(enumerator, "toString", function () {
      return "[object Enum]";
    }, false);

    enumerator[Symbol.iterator] = function () {
      var i = 0;
      return {
        next: function next() {
          return {
            done: i >= length,
            value: enumerator[i++]
          };
        }
      };
    };

    var frozen = Object.freeze(enumerator);
    return new Proxy(frozen, {
      get: function get(target, key) {
        if (!Reflect.has(target, key)) {
          throw new RangeError("Invalid enum property: ".concat(key));
        }

        return target[key];
      }
    });
  };

  return {
    defineConstant: defineConstant,
    makeEnum: makeEnum
  };
});
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Headers = factory();
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  /**
   * @summary maps headers to headers object
   * @param {string} [headers]
   * @returns {Object.<string, string>}
   */
  var mapResponseHeaders = function mapResponseHeaders() {
    var headers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var split = headers.split(/[\r\n]+/);
    var headerMap = {};

    if (!headers) {
      return headerMap;
    }

    var _iterator = _createForOfIteratorHelper(split),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var header = _step.value;
        var data = header.trim().split(': ');
        var name = data.shift();

        if (name) {
          var value = data.join(': ');
          headerMap[name] = value;

          if (/\-/.test(name)) {
            var snakeCase = name.split("-").map(function (part) {
              var fchar = part[0];
              return part.length > 1 ? fchar.toUpperCase() + part.slice(1) : part;
            }).join("");
            headerMap[snakeCase] = value;
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return headerMap;
  };

  return {
    mapResponseHeaders: mapResponseHeaders
  };
});
"use strict";

/**
 * @summary runs a function several times
 * @param {number} [num] 
 */
var runUntil = function runUntil() {
  var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return (
    /**
     * @param {function} callback
     */
    function (callback) {
      var i = 0;

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      while (i < num) {
        callback.apply(void 0, [i].concat(args));
        i++;
      }
    }
  );
};

module.exports = {
  runUntil: runUntil
};
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if ((typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Logic = factory();
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  /**
   * @summary ANDs lists of values
   * 
   * @description
   * For inputs of any size, fails if any of inputs are false
   *     
   *     | A | B | AND |
   *     | 0 | 0 | 0   |
   *     | 0 | 1 | 0   |
   *     | 1 | 0 | 0   |
   *     | 1 | 1 | 1   |
   * 
   * Due to being vacuously truthy, no arguments should produce`true`: \
   * ∀ arg: P (arg) => Q (arg) && ∀ arg: ¬ P (arg)
   * 
   * @param  {...any} [args]
   * @returns {boolean}
   */
  var AND = function AND() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.every(Boolean);
  };
  /**
   * @summary NANDs lists of values
   * 
   * @description
   * For inputs of any size, fails only if not all inputs are true
   * 
   *     | A | B | NAND |
   *     | 0 | 0 | 1    |
   *     | 0 | 1 | 1    |
   *     | 1 | 0 | 1    |
   *     | 1 | 1 | 0    |
   * 
   * Due to being vacuously truthy, no arguments should produce `true`: \
   * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
   * 
   * De Morgan's law:
   * 
   * Negation of conjunction: !A && !B === !(A + B)
   * 
   * @param  {...any} args 
   * @returns {boolean}
   */


  var NAND = function NAND() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return args.reduce(function (previous, current) {
      return !AND(previous, current);
    }, true);
  };
  /**
   * @summary ORs lists of values
   * 
   * @description
   * For inputs of any size, succeeds if any of the inputs are true
   * 
   *     | A | B | OR |
   *     | 0 | 0 | 0  |
   *     | 0 | 1 | 1  |
   *     | 1 | 0 | 1  |
   *     | 1 | 1 | 1  |
   * 
   * Due to being vacuously truthy, no arguments should produce `true`: \
   * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
   * 
   * @param  {...any} [args]
   * @returns {boolean}
   */


  var OR = function OR() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return args.length ? args.some(Boolean) : true;
  };
  /**
   * @summary NORs lists of values
   * 
   * @description
   * For inputs of any size, succeeds only if all inputs false
   * 
   *     | A | B | NOR |
   *     | 0 | 0 | 1   |
   *     | 0 | 1 | 0   |
   *     | 1 | 0 | 0   |
   *     | 1 | 1 | 0   |
   * 
   * Due to being vacuously truthy, no arguments should produce `true`: \
   * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
   * 
   * De Morgan's law:
   * 
   * Negation of disjunction: !A && !B === !(A + B)
   * 
   * @param  {...any} args 
   * @returns {boolean}
   */


  var NOR = function NOR() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return args.reduce(function (previous, current) {
      return !OR(previous, current);
    }, true);
  };
  /**
   * @summary XORs lists of values
   * 
   *  @description
   * For inputs > 2, proper XOR is several of XOR gates with result of binary XOR and new input
   * 
   *     | A | B | XOR |
   *     | 0 | 0 | 0   |
   *     | 0 | 1 | 1   |
   *     | 1 | 0 | 1   |
   *     | 1 | 1 | 0   |
   * 
   * Due to being vacuously truthy, no arguments should produce `true`: \
   * ∀ arg : P ( arg ) => Q ( arg ) && ∀ arg : ¬ P ( arg )
   * 
   * To be different from one-hot switch, XOR for more than 2 inputs \
   * should be a stacked instead of reducing XOR
   * 
   * @param  {...any} [args]
   * @returns {boolean}
   */


  var XOR = function XOR() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    var length = args.length;

    if (!length) {
      return true;
    }

    if (length === 1) {
      return !!args[0];
    }

    var curr = args[0],
        next = args[1];
    var xored = OR(curr, next) && OR(!curr, !next);
    return XOR.apply(void 0, [xored].concat(_toConsumableArray(args.slice(2))));
  };
  /**
   * @summary XNORs lists of values
   * 
   * @description
   * 
   * XNOR acts as an equivalence gate
   * 
   *     | A | B | XNOR |
   *     | 0 | 0 | 1    |
   *     | 0 | 1 | 0    |
   *     | 1 | 0 | 0    |
   *     | 1 | 1 | 1    |
   * 
   * XNOR = inverse of NOR
   * 
   * 
   * @param  {...any} args 
   * @returns {boolean}
   */


  var XNOR = function XNOR() {
    return arguments.length ? !XOR.apply(void 0, arguments) : true;
  };

  return {
    AND: AND,
    NAND: NAND,
    NOR: NOR,
    OR: OR,
    XNOR: XNOR,
    XOR: XOR
  };
});
"use strict";

/**
 * @fileoverview Math utilities
 * @author Oleg Valter
 * @module
 */

/**
 * @typedef {function} OperationApplier
 * @param {...number} args
 * @returns {number}
 */

/**
 * Abstract binary (here: operator(A,B)) operation
 * @param {function} operation 
 * @returns {OperationApplier}
 */
var binaryOp = function binaryOp(operation) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return args.length ? args.reduce(function (total, arg) {
      return operation(total, arg);
    }) : 0;
  };
};
/**
 * Divides all arguments
 * @param  {...number} args
 * @returns {number}
 */


var divide = function divide() {
  return binaryOp(function (a, b) {
    if (b === 0) {
      throw new RangeError('Cannot divide by 0');
    }

    return a / b;
  }).apply(void 0, arguments);
};
/**
 * Multiplies all arguments
 * @param  {...number} args
 * @return {number}
 */


var multiply = function multiply() {
  return binaryOp(function (a, b) {
    return a * b;
  }).apply(void 0, arguments);
};
/**
 * Substracts all arguments
 * @param  {...number} args 
 * @returns {number}
 */


var substract = function substract() {
  return binaryOp(function (a, b) {
    return a - b;
  }).apply(void 0, arguments);
};
/**
 * Sums all arguments
 * @param  {...number} args
 * @returns {number}
 */


var sum = function sum() {
  return binaryOp(function (a, b) {
    return a + b;
  }).apply(void 0, arguments);
};
/**
 * Complex utilities (based on base ops)
 */

/**
 * Simple average of all arguments
 * @param  {...number} args
 * @returns {number}
 */


var average = function average() {
  return sum.apply(void 0, arguments) / (arguments.length || 1);
};
/**
 * Abstraction for M / (A + ... + Z)
 * @param {number} divisor 
 * @returns {function}
 */


var divSum = function divSum(divisor) {
  return function () {
    return divide(sum.apply(void 0, arguments), divisor);
  };
};
/**
 * Abstraction for M * (A + ... + Z)
 * @param {number} multiplier 
 * @returns {function}
 */


var multSum = function multSum(multiplier) {
  return function () {
    return multiply(sum.apply(void 0, arguments), multiplier);
  };
};
/**
 * @summary Finds greatest common divisor
 * @param  {...number} args
 * @returns {number}
 */


var GCD = function GCD() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var length = args.length;

  if (!length) {
    throw new RangeError("Can't compute GCD of no args");
  }

  if (length === 1) {
    return args[0];
  }

  var gcd = function gcd(a, b) {
    return !a ? b : gcd(b % a, a);
  };

  return args.reduce(function (out, arg) {
    return gcd(out, arg);
  }, 0);
};
/**
 * @summary Finds least common multiplier
 * @param  {...number} args
 * @returns {number}
 */


var LCM = function LCM() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  var length = args.length;

  if (!args.length) {
    throw new RangeError("Can't compute LCM of no args");
  }

  if (length === 1) {
    return args[0];
  }

  return args.reduce(function (out, arg) {
    return arg * out / GCD(arg, out);
  });
};
/**
 * @summary returns first N fibonacci numbers
 * @param {number} [n]
 * @returns {number[]}
 */


function fibonacci() {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  var sequencer = function sequencer(times) {
    var acc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0];

    if (times === 1) {
      return acc;
    }

    var length = acc.length;
    acc.push(acc[length - 1] + acc[length - 2] || 1);
    return sequencer(times - 1, acc);
  };

  return n < 1 ? [] : sequencer(n);
}

module.exports = {
  average: average,
  divide: divide,
  divSum: divSum,
  fibonacci: fibonacci,
  GCD: GCD,
  HCF: GCD,
  LCM: LCM,
  multiply: multiply,
  multSum: multSum,
  substract: substract,
  sum: sum
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.whichKeysAreSet = exports.whichKeyIsSet = exports.union = exports.switchIfDiffProp = exports.smartGetter = exports.shallowFilter = exports.setIf = exports.pushOrInitProp = exports.isObject = exports.getOrInitProp = exports.getGetterDescriptors = exports.deepParseByPath = exports.deepMap = exports.deepGetByType = exports.deepFilter = exports.complement = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * @summary returns a complement of objects
 * @param  {...object} sources 
 * @returns {object}
 */
var complement = function complement() {
  var tracked = [];

  for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  return sources.reduce(function (acc, curr) {
    for (var key in curr) {
      if (tracked.includes(key)) {
        delete acc[key];
        continue;
      }

      acc[key] = curr[key];
      tracked.push(key);
    }

    return acc;
  }, {});
};
/**
 * @summary deep gets properties of type
 * @param {object} [obj]
 */


exports.complement = complement;

var deepGetByType = function deepGetByType() {
  var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return (
    /**
     * @param {("string"|"number"|"object"|"undefined"|"boolean"|null)} type
     * @returns {object}
     */
    function (type) {
      var output = {};
      Object.entries(obj).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            val = _ref2[1];

        if (_typeof(val) === "object" && val) {
          var subvals = deepGetByType(val)(type);
          return Object.assign(output, subvals);
        }

        var shouldSet = _typeof(val) === type || type === null && val === null;

        if (shouldSet) {
          output[key] = val;
        }
      });
      return output;
    }
  );
};

exports.deepGetByType = deepGetByType;

var initArrOrObj = function initArrOrObj(entity) {
  return entity !== undefined ? [] : {};
};
/**
 * @summary deep parses properties of type
 * @param {object} source 
 * @returns {object}
 */


var deepParseByPath = function deepParseByPath(source) {
  if (!isObject(source)) {
    return source;
  }

  var output = {};
  var idxRegExp = /([\w$@]+)(?:\[(\d+)\])?/;
  Object.entries(source).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        key = _ref4[0],
        val = _ref4[1];

    var levels = key.split(".");
    var tmp = output;
    var tmpIdx;
    var length = levels.length;
    levels.forEach(function (level, i) {
      var _level$match = level.match(idxRegExp),
          _level$match2 = _slicedToArray(_level$match, 3),
          subkey = _level$match2[1],
          idx = _level$match2[2];

      tmpIdx || subkey in tmp || (tmp[subkey] = initArrOrObj(idx));

      if (i < length - 1) {
        tmp = tmp[subkey];
        idx !== undefined && (tmpIdx = idx);
        return;
      }

      if (tmpIdx) {
        tmpIdx in tmp || (tmp[tmpIdx] = initArrOrObj(idx));
      }

      var parsedVal = deepParseByPath(val);
      var idxOrKey = tmpIdx || subkey;

      if (tmpIdx !== undefined) {
        tmp[tmpIdx][subkey] = parsedVal;
        return;
      }

      if (idx !== undefined) {
        tmp[idxOrKey][idx] = parsedVal;
      } else {
        tmp[idxOrKey] = parsedVal;
      }
    });
  });
  return output;
};
/**
 * @typedef {({ 
 *  configurable: boolean,
 *  enumerable: boolean,
 *  writable: boolean,
 *  get: function, 
 *  set: function,
 *  value: any
 * })} PropertyDescriptor
 * 
 * @param {object} obj
 * @returns {PropertyDescriptor}
 */


exports.deepParseByPath = deepParseByPath;

var getGetterDescriptors = function getGetterDescriptors() {
  var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.entries(Object.getOwnPropertyDescriptors(obj)).filter(function (entry) {
    return typeof entry[1].get === "function";
  });
};
/**
 * @summary gets value from object or inits it via callback
 * @param {object} obj
 * @param {string} propName
 * @param {function(object) : any} [callback]
 * @returns {any}
 */


exports.getGetterDescriptors = getGetterDescriptors;

var getOrInitProp = function getOrInitProp(obj, propName, callback) {
  if (propName in obj) {
    return obj[propName];
  }

  if (callback) {
    obj[propName] = callback(obj);
    return obj[propName];
  }
};
/**
 * @summary checks if an object is a valid object
 * @param {object} obj
 * @returns {boolean}
 */


exports.getOrInitProp = getOrInitProp;

var isObject = function isObject(obj) {
  return _typeof(obj) === 'object' && obj !== null && !Array.isArray(obj);
};
/**
 * @summary pushes value in or inits array with value
 * @param {object} obj 
 * @param {string} key 
 * @param {*} value 
 * @returns {object}
 */


exports.isObject = isObject;

var pushOrInitProp = function pushOrInitProp(obj, key, value) {
  if (key in obj) {
    var temp = obj[key];

    if (Array.isArray(temp)) {
      temp.push(value);
      return obj;
    }

    obj[key] = [temp, value];
    return obj;
  }

  obj[key] = [value];
  return obj;
};
/**
 * @typedef {object} SetOptions
 * @property {string} [coerce]
 * 
 * 
 * @summary copies property if it exists
 * @param {object} source
 * @param {string} key 
 * @param {object} [target]
 * @param {SetOptions} [options]
 * @returns {object}
 */


exports.pushOrInitProp = pushOrInitProp;

var setIf = function setIf(source, key) {
  var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (typeof key !== "string") {
    return target;
  }
  /** @type {Map<string, function>} */


  var coercionMap = new Map().set("string", function (val) {
    if (typeof val === "string") {
      return val;
    }

    if (typeof val === "number") {
      return Number.prototype.toString.call(val);
    }

    return val;
  });
  var coerce = options.coerce;

  if (key in source) {
    var value = source[key];
    target[key] = coerce ? coercionMap.get(coerce)(value) : value;
  }

  return target;
};
/**
 * @summary defines a smart (memoizable) getter
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get}
 * @param {object} context 
 * @param {string} propName 
 * @param {function} callback 
 * @returns {object}
 */


exports.setIf = setIf;

var smartGetter = function smartGetter(context, propName, callback) {
  return Object.defineProperty(context, propName, {
    configurable: true,
    get: function get() {
      var temp = callback(context);
      Object.defineProperty(context, propName, {
        value: temp
      });
      return temp;
    }
  });
};
/**
 * @summary returns one of the object props equal
 * @param {object} [target] first object to compare
 * @param {string} propName property name
 */


exports.smartGetter = smartGetter;

var switchIfDiffProp = function switchIfDiffProp(target, propName) {
  return (
    /**
     * @param {object} [source] second object to compare
     * @returns {object}
     */
    function (source) {
      if (!target) {
        return source || {};
      }

      if (!source) {
        return target || {};
      }

      return target[propName] === source[propName] ? target : source;
    }
  );
};
/**
 * @summary makes a union of object
 * @param {object} target 
 * @param  {...object} sources 
 * @returns {object}
 */


exports.switchIfDiffProp = switchIfDiffProp;

var union = function union(target) {
  var union = Object.assign({}, target);
  var assignedKeys = {};

  for (var _len2 = arguments.length, sources = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    sources[_key2 - 1] = arguments[_key2];
  }

  for (var _i2 = 0, _sources = sources; _i2 < _sources.length; _i2++) {
    var source = _sources[_i2];

    for (var key in source) {
      if (!assignedKeys[key] && !(key in union)) {
        assignedKeys[key] |= 1;
        union[key] = source[key];
      }
    }
  }

  return union;
};
/**
 * @summary checks which key is set on object
 * @param {object} obj 
 * @param  {...string} [keys] 
 * @returns {?string}
 * 
 * @throws {RangeError}
 */


exports.union = union;

var whichKeyIsSet = function whichKeyIsSet(obj) {
  var matched = 0;

  for (var _len3 = arguments.length, keys = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    keys[_key3 - 1] = arguments[_key3];
  }

  var filtered = keys.filter(function (key) {
    var has = obj.hasOwnProperty(key);

    if (has) {
      if (matched) {
        throw new RangeError("Object has more than one provided own keys");
      }

      matched |= 1;
    }

    return has;
  });
  return filtered[0] || null;
};
/**
 * @summary checks which keys are set on object
 * @param {object} obj 
 * @param  {...string} [keys] 
 * @returns {string[]}
 */


exports.whichKeyIsSet = whichKeyIsSet;

var whichKeysAreSet = function whichKeysAreSet(obj) {
  for (var _len4 = arguments.length, keys = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    keys[_key4 - 1] = arguments[_key4];
  }

  return keys.filter(function (key) {
    return obj.hasOwnProperty(key);
  });
};
/**
 * @summary maps each object key with mapper
 * @param {object|[]} obj 
 * @param {function (string,any) : any} mapper 
 * @param {{ 
 *  opaqueArrays : (boolean|true), 
 *  keyMapper : function (string) : string 
 * }} [options]
 * @returns {object|[]}
 */


exports.whichKeysAreSet = whichKeysAreSet;

var deepMap = function deepMap(obj, mapper) {
  var _ref5 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      keyMapper = _ref5.keyMapper,
      _ref5$opaqueArrays = _ref5.opaqueArrays,
      opaqueArrays = _ref5$opaqueArrays === void 0 ? true : _ref5$opaqueArrays;

  var isArr = Array.isArray(obj);
  var output = isArr ? [] : {};
  var mapKeys = typeof keyMapper === "function";
  Object.entries(obj).forEach(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2),
        key = _ref7[0],
        value = _ref7[1];

    if (Array.isArray(value) && !opaqueArrays) {
      output[mapKeys ? keyMapper(key) : key] = mapper(key, value);
      return;
    }

    var mapped = _typeof(value) === "object" && value ? deepMap(value, mapper, {
      keyMapper: keyMapper,
      opaqueArrays: opaqueArrays
    }) : mapper(mapKeys ? keyMapper(key) : key, value);
    output[mapKeys && !isArr ? keyMapper(key) : key] = mapped;
  });
  return output;
};
/**
 * @summary pushes or sets property
 * @param {object|[]} arrOrObj 
 * @param {string} key 
 * @param {any} val 
 * @returns {object|[]}
 */


exports.deepMap = deepMap;

var pushOrSet = function pushOrSet(arrOrObj, key, val) {
  Array.isArray(arrOrObj) ? arrOrObj.push(val) : arrOrObj[key] = val;
  return arrOrObj;
};
/**
 * @typedef {object} DeepFilterConfig
 * @property {object} [accumulator] accumulates entities filtered out
 * @property {boolean|true} [opaqueArrays] if false, treats arrays as values
 * @property {boolean|true} [opaqueObjects] if false, treats objects as values
 * 
 * @summary filters each object key with filterer
 * 
 * @description
 *  Predicate in deep filter behaves similar built-in 
 *  Array.prototype.filter method, but passes a key first
 * 
 * @param {any} input 
 * @param {function (string,any, number, object|[], boolean): boolean} filterer 
 * @param {DeepFilterConfig} [options]
 * @returns {object|[]}
 */


var deepFilter = function deepFilter(input, filterer) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var accumulator = options.accumulator,
      _options$opaqueArrays = options.opaqueArrays,
      opaqueArrays = _options$opaqueArrays === void 0 ? true : _options$opaqueArrays,
      _options$opaqueObject = options.opaqueObjects,
      opaqueObjects = _options$opaqueObject === void 0 ? true : _options$opaqueObject;
  var arrAsBase = Array.isArray(input);
  var objAsBase = _typeof(input) === "object" && input;
  var output = arrAsBase ? [] : objAsBase ? {} : input;
  Object.entries(input).forEach(function (_ref8, index) {
    var _ref9 = _slicedToArray(_ref8, 2),
        key = _ref9[0],
        val = _ref9[1];

    var arrAsVal = Array.isArray(val);
    var objAsVal = _typeof(val) === "object" && val;

    if (opaqueArrays && arrAsVal || opaqueObjects && objAsVal) {
      var filtered = deepFilter(val, filterer, options) || {};
      var hasKeys = Object.keys(filtered).length;

      if (hasKeys) {
        return pushOrSet(output, key, filtered);
      }

      return accumulator && pushOrSet(accumulator, key, val);
    }

    var canAdd = filterer(key, val, index, input, arrAsBase);

    if (canAdd) {
      return pushOrSet(output, key, val);
    }

    return accumulator && pushOrSet(accumulator, key, val);
  });
  return output;
};
/**
 * @typedef {object} ShallowFilterConfig
 * @property {object[]|object} source
 * @property {function (string,any) : boolean} [filter]
 * @property {object[]|object} [accumulator]
 * 
 * @summary shallow filters an object or array of objects
 * @param {ShallowFilterConfig}
 * @returns {objct[]|object}
 */


exports.deepFilter = deepFilter;

var shallowFilter = function shallowFilter(_ref10) {
  var source = _ref10.source,
      _ref10$filter = _ref10.filter,
      filter = _ref10$filter === void 0 ? function () {
    return true;
  } : _ref10$filter,
      accumulator = _ref10.accumulator;
  var arrAsBase = Array.isArray(source);
  var objAsBase = _typeof(source) === "object" && source;
  var output = arrAsBase ? [] : objAsBase ? {} : source;
  Object.entries(source).forEach(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        k = _ref12[0],
        v = _ref12[1];

    filter(v, k, source) ? pushOrSet(output, k, v) : accumulator && pushOrSet(accumulator, k, v);
  });
  return output;
};

exports.shallowFilter = shallowFilter;
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * @summary Makes an inspectable Promise
 */
var ExtendedPromise = /*#__PURE__*/function (_Promise) {
  _inherits(ExtendedPromise, _Promise);

  var _super = _createSuper(ExtendedPromise);

  /**
   * @param {function(function, function)} executor
   */
  function ExtendedPromise(executor) {
    var _this;

    _classCallCheck(this, ExtendedPromise);

    var privates = {
      fulfilled: false,
      pending: true,
      rejected: false,
      value: undefined
    };
    _this = _super.call(this, function (resolve, reject) {
      executor(function (res) {
        privates.fulfilled = true;
        privates.pending = false;
        privates.value = res;
        resolve(res);
      }, function (err) {
        privates.rejected = true;
        privates.pending = false;
        privates.value = err;
        reject(err);
      });
    });
    Object.defineProperties(_assertThisInitialized(_this), {
      fulfilled: {
        configurable: false,
        get: function get() {
          return privates.fulfilled;
        }
      },
      pending: {
        configurable: false,
        get: function get() {
          return privates.pending;
        }
      },
      rejected: {
        configurable: false,
        get: function get() {
          return privates.rejected;
        }
      },
      settled: {
        configurable: false,
        get: function get() {
          return !privates.pending && !(privates.value instanceof Promise);
        }
      },
      value: {
        configurable: false,
        get: function get() {
          return privates.value;
        }
      }
    });
    return _this;
  }

  return ExtendedPromise;
}( /*#__PURE__*/_wrapNativeSuper(Promise));

module.exports = {
  ExtendedPromise: ExtendedPromise
};
"use strict";

/**
 * Generates pseudo-random int[]
 * @param {number} len 
 * @param {number} [seed]
 * @returns {number[]} 
 */
var randomArray = function randomArray(len) {
  var seed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var output = [];
  var i = 0;

  while (i < len) {
    var val = Math.floor(Math.random() * seed);
    output[i] = val;
    i++;
  }

  return output;
};

module.exports = {
  randomArray: randomArray
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trimAndRemoveSep = exports.splitIntoSentences = exports.sentenceCase = exports.pluralizeCountable = exports.parToSentenceCase = exports.isUcase = exports.isLcase = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * @summary checks if string is lowcase
 * @param {string} [str] 
 * @returns {boolean}
 */
var isLcase = function isLcase() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

  if (!str) {
    return false;
  }

  return Array.prototype.every.call(str, function (_char) {
    var code = _char.codePointAt(0);

    return code < 65 || code > 90;
  });
};
/**
 * @summary checks if string is uppercase
 * @param {string} [str]
 * @returns {boolean}
 */


exports.isLcase = isLcase;

var isUcase = function isUcase() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

  if (!str) {
    return false;
  }

  return Array.prototype.every.call(str, function (_char2) {
    var code = _char2.codePointAt(0);

    return /\W/.test(_char2) || code > 64 && code < 91;
  });
};
/**
 * @summary changes noun (countable) to plural form and prepends amount
 * 
 * @example
 * 1,test -> 1 test
 * 2,test -> 2 tests
 * 21,test -> 21 tests
 * 
 * @param {number} amount
 * @param {string} noun
 * @returns {string}
 */


exports.isUcase = isUcase;

var pluralizeCountable = function pluralizeCountable(amount, noun) {
  var normalized = noun.toLowerCase();

  if (amount === 1) {
    return "1 ".concat(normalized);
  }

  var irregulars = {
    "child": "children",
    "goose": "geese",
    "tooth": "teeth",
    "foot": "feet",
    "mous": "mice",
    "person": "people"
  };
  var irregularPlural = irregulars[normalized];

  if (irregularPlural) {
    return "".concat(amount, " ").concat(irregularPlural);
  }

  var manWomanCase = normalized.match(/(\w*)(man|woman)$/);

  if (manWomanCase) {
    return "".concat(amount, " ").concat(manWomanCase[1]).concat(manWomanCase[2].replace("a", "e"));
  }

  var staySameExceptions = new Set(["sheep", "series", "species", "deer", "fish"]);

  if (staySameExceptions.has(normalized)) {
    return "".concat(amount, " ").concat(normalized);
  }

  var wordBase = normalized.slice(0, -2);
  var irregularEndingWithA = new Set(["phenomenon", "datum", "criterion"]);

  if (irregularEndingWithA.has(normalized)) {
    return "".concat(amount, " ").concat(wordBase, "a");
  }

  var twoLastLetters = normalized.slice(-2);
  var oneLastLetter = twoLastLetters.slice(-1);
  var irregularEndingWithForFe = new Set(["roofs", "belief", "chef", "chief"]);

  if (irregularEndingWithForFe.has(normalized)) {
    return "".concat(amount, " ").concat(normalized, "s");
  }

  if (/(?:f|fe)$/.test(noun)) {
    return "".concat(amount, " ").concat(normalized.replace(/(?:f|fe)$/, "ves"));
  }

  var twoLettersReplaceMap = {
    "is": "es",
    "us": "i"
  };
  var lastLettersReplace = twoLettersReplaceMap[twoLastLetters];

  if (lastLettersReplace && wordBase.length > 1) {
    return "".concat(amount, " ").concat(wordBase).concat(lastLettersReplace);
  }

  var twoLettersAddMap = new Set(["ch", "ss", "sh"]);

  if (twoLettersAddMap.has(twoLastLetters)) {
    return "".concat(amount, " ").concat(normalized, "es");
  }

  var oneLastLetterMap = new Set(["s", "x", "z"]);

  if (oneLastLetterMap.has(oneLastLetter)) {
    return "".concat(amount, " ").concat(normalized, "es");
  }

  var consonants = new Set(["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "x", "z", "w", "y"]);
  var isLetterBeforeLastConsonant = consonants.has(normalized.slice(-2, -1));

  if (oneLastLetter === "o" && isLetterBeforeLastConsonant) {
    var lastOexceptions = new Set(["photo", "buro", "piano", "halo"]);
    return "".concat(amount, " ").concat(normalized).concat(lastOexceptions.has(normalized) ? "s" : "es");
  }

  if (oneLastLetter === "y" && isLetterBeforeLastConsonant) {
    return "".concat(amount, " ").concat(normalized.slice(0, -1), "ies");
  }

  return "".concat(amount, " ").concat(normalized, "s");
};

exports.pluralizeCountable = pluralizeCountable;

var sentensify = function sentensify(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
/**
 * @summary makes word Sentence-case
 * 
 * @param {{
 *  isSentence : (boolean|false),
 *  text : string,
 *  exempt : string[]
 * }}
 * 
 * @returns {string}
 */


var sentenceCase = function sentenceCase() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$text = _ref.text,
      text = _ref$text === void 0 ? "" : _ref$text,
      _ref$isSentence = _ref.isSentence,
      isSentence = _ref$isSentence === void 0 ? false : _ref$isSentence,
      _ref$exempt = _ref.exempt,
      exempt = _ref$exempt === void 0 ? [] : _ref$exempt;

  if (isSentence) {
    var _text$split = text.split(/\s+/),
        _text$split2 = _toArray(_text$split),
        first = _text$split2[0],
        rest = _text$split2.slice(1);

    return [exempt.includes(first) ? first : sentensify(first)].concat(_toConsumableArray(rest.map(function (wd) {
      return exempt.includes(wd) ? wd : wd.toLowerCase();
    }))).join(" ");
  }

  return exempt.includes(text) ? text : sentensify(text);
};
/**
 * @summary splits a string into sentences
 * @param {string} paragraph 
 * @returns {string[]}
 */


exports.sentenceCase = sentenceCase;

var splitIntoSentences = function splitIntoSentences(paragraph) {
  if (!paragraph) {
    return [];
  }

  var splitRegExp = /([.?!]+)\s+/gim;
  return paragraph.split(splitRegExp).reduce(function (acc, cur, i) {
    i % 2 && (acc[acc.length - 1] += cur) || acc.push(cur);
    return acc;
  }, []);
};
/**
 * @summary trims string and removes non-word chars
 * 
 * @example
 *    "pineapple, apple (!); --juice" => "pineapple apple juice"
 * 
 * @param {string} [input] 
 * @returns {string}
 */


exports.splitIntoSentences = splitIntoSentences;

var trimAndRemoveSep = function trimAndRemoveSep() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return input.trim().replace(/[^\s\w]|_/g, '');
};
/**
 * @summary makes paragraph sentence case
 * 
 * @param {{
 *  text : string,
 *  exempt : string[]
 * }}
 * 
 * @returns {string}
 */


exports.trimAndRemoveSep = trimAndRemoveSep;

var parToSentenceCase = function parToSentenceCase() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$text = _ref2.text,
      text = _ref2$text === void 0 ? "" : _ref2$text,
      _ref2$exempt = _ref2.exempt,
      exempt = _ref2$exempt === void 0 ? [] : _ref2$exempt;

  var sentences = splitIntoSentences(text);
  var normalized = sentences.map(function (sentence) {
    return sentenceCase({
      isSentence: true,
      text: sentence,
      exempt: exempt
    });
  });
  return normalized.join(" ");
};

exports.parToSentenceCase = parToSentenceCase;
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Node base class
 * @class
 */
var Node =
/**
 * @param {*} value
 */
function Node(value) {
  _classCallCheck(this, Node);

  this.value = value;
  this.next = null;
};

var BinaryNode = /*#__PURE__*/function (_Node) {
  _inherits(BinaryNode, _Node);

  var _super = _createSuper(BinaryNode);

  function BinaryNode(value) {
    var _this;

    _classCallCheck(this, BinaryNode);

    _this = _super.call(this, value);
    _this.left = _this.right = null;
    return _this;
  }

  return BinaryNode;
}(Node);

var TernaryNode = /*#__PURE__*/function (_Node2) {
  _inherits(TernaryNode, _Node2);

  var _super2 = _createSuper(TernaryNode);

  function TernaryNode(value) {
    var _this2;

    _classCallCheck(this, TernaryNode);

    _this2 = _super2.call(this, value);
    _this2.left = _this2.center = _this2.right = null;
    return _this2;
  }

  return TernaryNode;
}(Node);
/**
 * LinkedList base class
 * @class
 */


var LinkedList = /*#__PURE__*/function () {
  /**
   * @param {Node} root 
   */
  function LinkedList(root) {
    _classCallCheck(this, LinkedList);

    this.root = root;
    /** @member {Number} size */

    this.size = root ? 1 : 0;
  }
  /**
   * Getter for last Node in List
   * @returns {Node}
   */


  _createClass(LinkedList, [{
    key: "add",

    /**
     * 
     * @param {*} value 
     * @returns {LinkedList}
     */
    value: function add(value) {
      var root = this.root;
      var node = new Node(value);
      !root && (this.root = node) || (this.last.next = node);
      this.size++;
      return this;
    }
    /**
     * 
     * @param {Number} [index]
     * @returns {?Node}
     */

  }, {
    key: "at",
    value: function at() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var root = this.root;

      if (!root) {
        return null;
      }

      if (index === 0) {
        return root;
      }

      var currNode = root;
      var pos = 0;

      while (currNode.next) {
        if (index === pos) {
          return currNode;
        }

        currNode = currNode.next;
        pos++;
      }

      return null;
    }
    /**
     * 
     * @param {*} value
     * @param {Number} [index]
     * @returns {LinkedList}
     */

  }, {
    key: "insert",
    value: function insert(value, index) {
      var size = this.size;

      if (!size || index === undefined) {
        return this.add(value);
      }

      var node = new Node(value);

      if (index === 0) {
        var root = this.root;
        node.next = root;
        this.root = node;
        this.size++;
        return this;
      }

      var parent = this.at(index - 1);

      if (parent) {
        node.next = parent.next;
        parent.next = node;
        this.size++;
      }

      return this;
    }
    /**
     * Generates a LinkedList from 
     * value sequence
     * @param {*[]} sequence 
     * @returns {Tree}
     */

  }, {
    key: "pop",

    /**
     * 
     * @returns {LinkedList}
     */
    value: function pop() {
      var size = this.size;

      if (!size) {
        return this;
      }

      if (size === 1) {
        this.root = null;
        this.size--;
        return this;
      }

      var beforeLast = this.at(size - 2);
      beforeLast.next = null;
      this.size--;
      return this;
    }
    /**
     * 
     * @param {*} [index] 
     * @returns {LinkedList}
     */

  }, {
    key: "remove",
    value: function remove(index) {
      var size = this.size;

      if (!size || index >= size) {
        return this;
      }

      if (size === 1 || index === undefined) {
        return this.pop();
      }

      var parent = this.at(index - 1);

      if (parent) {
        parent.next = parent.next.next;
        this.size--;
      }

      return this;
    }
  }, {
    key: "last",
    get: function get() {
      var root = this.root;
      var current = root;

      while (current.next) {
        current = current.next;
      }

      return current || null;
    }
    /**
     * Getter for last index in List
     * @returns {Number}
     */

  }, {
    key: "lastIndex",
    get: function get() {
      var size = this.size;
      return size ? size - 1 : 0;
    }
  }], [{
    key: "generate",
    value: function generate() {
      var sequence = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var list = new LinkedList();

      var _iterator = _createForOfIteratorHelper(sequence),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var value = _step.value;
          list.add(value);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return list;
    }
  }]);

  return LinkedList;
}();

var BinaryTree = /*#__PURE__*/function (_LinkedList) {
  _inherits(BinaryTree, _LinkedList);

  var _super3 = _createSuper(BinaryTree);

  function BinaryTree(root) {
    _classCallCheck(this, BinaryTree);

    return _super3.call(this, root);
  }

  return BinaryTree;
}(LinkedList);

var TernaryTree = /*#__PURE__*/function (_LinkedList2) {
  _inherits(TernaryTree, _LinkedList2);

  var _super4 = _createSuper(TernaryTree);

  function TernaryTree(root) {
    _classCallCheck(this, TernaryTree);

    return _super4.call(this, root);
  }

  return TernaryTree;
}(LinkedList);

module.exports = {
  Node: Node,
  BinaryNode: BinaryNode,
  TernaryNode: TernaryNode,
  LinkedList: LinkedList,
  BinaryTree: BinaryTree,
  TernaryTree: TernaryTree
};
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * @fileoverview JavaScript Utilities
 * @author Oleg Valter
 * @version 0.0.2
 */

/**
 * General Utilities
 */
//delays callback for a specified number of milliseconds;
var delay = function delay(time) {
  return function (callback) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return setTimeout(function () {
        return callback.apply(void 0, args);
      }, time || 100);
    };
  };
};

var noop = function noop() {};
/**
 * Number utilities
 */

/**
 * Calculates bias offset (offset-K) 
 * for a given number of bits
 * @param {BigInt|Number} bits 
 */


var offsetK = function offsetK(bits) {
  var offset = Math.pow(2, bits - 1);
  return offset > Number.MAX_SAFE_INTEGER ? BigInt(offset) - 1n : offset - 1;
}; //partially applied utils;


var exp32 = offsetK(32);
var exp64 = offsetK(64);
/**
 * Object Utilities
 */
//Extracts entries from an object;

var getEntries = function getEntries(object) {
  return Object.keys(object).map(function (key) {
    return object[key];
  });
}; //Extracts key name by its value;


var keysByValue = function keysByValue(object) {
  return function (value) {
    return Object.keys(object).filter(function (key) {
      return object[key] === value;
    });
  };
}; //performs deep Object comparison;


var compare = function compare() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return args.every(function (arg, a) {
    if (a) {
      var previous = args[a - 1];
      if (_typeof(arg) !== _typeof(previous) && !(arg instanceof RegExp) && !(previous instanceof RegExp)) return false;

      switch (_typeof(arg)) {
        case 'function':
          return Function.prototype.toString.call(arg) === Function.prototype.toString.call(previous);

        case 'object':
          //test against null;
          if (arg === null || previous === null) return arg === previous; //test against RegExp (backwards);

          if (arg instanceof RegExp && (typeof previous === 'string' || typeof previous === 'number')) return arg.test(previous.toString());
          var isOK = true; //check current element;

          for (var key in arg) {
            isOK = previous.hasOwnProperty(key) && compare(arg[key], previous[key]);
            if (!isOK) return false;
          } //check previous element;


          for (var _key3 in previous) {
            isOK = arg.hasOwnProperty(_key3) && compare(arg[_key3], previous[_key3]);
            if (!isOK) return false;
          }

          return isOK;

        default:
          //test against RegExp (forwards);
          if ((typeof arg === 'string' || typeof arg === 'number') && previous instanceof RegExp) return previous.test(arg.toString());
          return arg === previous;
      }
    } else {
      return true;
    }
  });
}; //finds latest element deeply equal to a given one;


var getDeepLastIndex = function getDeepLastIndex(arr, elem) {
  var lidx = -1;
  var aIndex = arr.length - 1;

  for (var index = aIndex; index >= 0; index--) {
    var same = compare(arr[index], elem);

    if (same) {
      lidx = index;
      break;
    }
  }

  return lidx;
};
/**
 * Array Utilities
 */

/**
 * Converts bits list to decimal number
 * @param {Number[]} bits
 * @returns {Number}
 */


var toDecimal = function toDecimal(bits) {
  var len = bits.length - 1;
  return bits.reduce(function (acc, bit, pos) {
    return acc + bit * Math.pow(2, len - pos);
  }, 0);
};
/**
 * Subsplits an Array into several parts
 * @param {number} [n] 
 * @returns {function(Array): any[][]}
 */


var subsplit = function subsplit() {
  var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  return function (array) {
    var length = array.length;
    var maxSplitLength = Math.floor(length / n);
    var output = [];

    for (var i = 0; i < n; i++) {
      var start = i * maxSplitLength;
      output.push(array.slice(start, start + maxSplitLength));
    }

    return output;
  };
}; //Allocates an Array (avoids using loops);


var allocArray = function allocArray(numElems) {
  return new Array(numElems || 0).fill(1);
}; //Wraps non-Array data into an Array;


var arrayify = function arrayify(data) {
  return data instanceof Array ? data : [data];
}; //Resolves with the result of async mapping over an Array;


var asyncMap = function asyncMap(array) {
  return /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(callback) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Promise.all(array.map(callback));

            case 2:
              return _context.abrupt("return", _context.sent);

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
}; //Gets an object satisfying value;


var byKeyVal = function byKeyVal(array) {
  return function (key) {
    return function (value) {
      return array.filter(function (obj) {
        return obj[key] === value;
      });
    };
  };
}; //Gets last element of an Array (regardless of length);


var getLastElem = function getLastElem(array) {
  return array[array.length - 1];
}; //Gets every Nth element of an Array (optional offset);


var getEveryNthElem = function getEveryNthElem(pos) {
  return function (array, offset) {
    return array.slice(offset || 0).filter(function (elem, e) {
      return !((e + 1) % pos);
    });
  };
}; //Gets all elements of an Array except for one at position (composable);


var getOtherElems = function getOtherElems(pos) {
  return function (array) {
    return array.filter(function (elem, e) {
      return e !== pos;
    });
  };
}; //Gets elements of an Array at even positions;


var getEvenPosElems = function getEvenPosElems(array) {
  return array.filter(function (elem, e) {
    return e % 2;
  });
}; //Gets elements of an Array at odd positions;


var getOddPosElems = function getOddPosElems(array) {
  return array.filter(function (elem, e) {
    return !(e % 2);
  });
}; //Maps elements of an Array and returns only elements that are defined;


var mapExisting = function mapExisting(callback) {
  return function (array) {
    return array.map(callback).filter(function (e) {
      return e !== undefined;
    });
  };
};
/**
 * Counts number of permutations given the 
 * set of entities and repetitions number
 * @param {any[]} set 
 * @param {Number} repeat
 * @returns {Number}
 */


var numCombinations = function numCombinations(set, repeat) {
  var len = set.length;
  return repeat ? Math.pow(len, repeat) : 0;
}; //Maps relative growth Array into actual values using [0] element as base


var relativeGrowth = function relativeGrowth(array) {
  return array.reduce(function (acc, elem) {
    return acc.concat([elem + (acc[acc.length - 1] || 0)]);
  }, []);
}; //Reorders a 2D Array by provided ordering criteria 
//and filters out indices not present in criteria


var filterAndReorder = function filterAndReorder(source, order) {
  return source.map(function (row, r) {
    return row.map(function (cell, c) {
      return source[r][order[c]];
    }).filter(function (cell, c) {
      return cell !== undefined;
    });
  });
}; //Removes elements from start to end and returns modified Array (no mutation);


var simpleSplice = function simpleSplice(array) {
  return function (start, end) {
    return array.filter(function (e, pos) {
      return pos < start || pos > end;
    });
  };
}; //Splits an Array on every Nth element;
//[1,2,3,4] on second elem returns [ [1,2], [3,4] ];
//0 as position results in an empty Array;


var splitOnNthElem = function splitOnNthElem(pos) {
  return function (array) {
    return array.map(function (e, i, a) {
      return !(i % pos) ? a.slice(i, i + pos) : 0;
    }).filter(function (e) {
      return e.length;
    });
  };
}; //Returns whether number of occurencies of each element is unique


var uniqueOccurrences = function uniqueOccurrences(arr) {
  var copy = arr.map(function (e) {
    return e;
  }).sort();
  var occurs = copy.reduce(function (a, c, i) {
    return c !== copy[i - 1] ? a.concat([copy.slice(i, copy.lastIndexOf(c) + 1).length]) : a;
  }, []);
  return !occurs.some(function (e, i) {
    return occurs.lastIndexOf(e) > i;
  });
};
/**
 * Date Utilities
 */
//adds number od days to a Date;


var addDays = function addDays(days) {
  return function (date) {
    return new Date(date.valueOf() + (days || 0) * 86400000);
  };
}; //splits date into ISO standard date or time string;


var isoDate = function isoDate(date) {
  return date.toISOString().slice(0, 10);
};

var isoTime = function isoTime(date) {
  return date.toISOString().slice(11, 19);
}; //counts number of nights between two date instances;


var nights = function nights(start, end) {
  return (end.valueOf() - start.valueOf()) / 86400000;
};
/**
 * Logging Utilities
 */
//logs object at log time;


var logFixed = function logFixed(object) {
  return console.log(JSON.parse(JSON.stringify(object)));
};
/**
 * DOM Utilities
 */
//simply gets element by id;


var byId = function byId(id) {
  return document.querySelector("#".concat(id));
};

var byClass = function byClass(cls) {
  return document.querySelector(".".concat(cls));
}; //clears element of children (chainable);


var clearElem = function clearElem(elem) {
  return Array.from(elem.children).forEach(function (child) {
    return child.remove();
  }) || elem;
};
/**
 * Transforms json to key : value; string
 * @param {Object} [json]
 * @returns {String}
 */


var jsonToFormatString = function jsonToFormatString() {
  var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return Object.entries(json).map(function (entry) {
    var _entry = _slicedToArray(entry, 2),
        key = _entry[0],
        value = _entry[1];

    return "".concat(key, ": ").concat(value);
  }).join('; ');
};
/**
 * Stringifies JSON into DOMString
 * @param {Object} [json] 
 * @returns {DOMString}
 */


var jsonToDOMString = function jsonToDOMString() {
  var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var keyErrMsg = "DOMString key should be set";
  var valueErrMsg = "DOMString value should be set";
  var errors = new Map().set('key', function (value) {
    throw new SyntaxError("".concat(keyErrMsg, ": ").concat(value));
  }).set('value', function (key) {
    throw new SyntaxError("".concat(valueErrMsg, ": ").concat(key));
  });
  return Object.entries(json).map(function (entry) {
    var _entry2 = _slicedToArray(entry, 2),
        key = _entry2[0],
        value = _entry2[1];

    value === '' && errors.get('value')(key);
    key === '' && errors.get('key')(value);
    return "".concat(key, "=").concat(value);
  }).join(',');
}; //removes first child from element if it has any (non-leaking);


var removeFirstChild = function removeFirstChild(element) {
  return void !element.firstChild || element.firstChild.remove();
}; //removes N last children from element if it has any (non-leaking);


var removeLastChildren = function removeLastChildren(num) {
  return function (element) {
    return void Array.from(element.children).slice(-num).forEach(function (child) {
      return child.remove();
    });
  };
}; //changes check state of an element + 2 use cases;


var changeCheck = function changeCheck(cbx) {
  return function (value) {
    return cbx.checked = value;
  };
};

var check = function check(cbx) {
  return changeCheck(cbx)(true);
};

var uncheck = function uncheck(cbx) {
  return changeCheck(cbx)(false);
}; //toggles class on an element if it is set and vice versa (non-leaking);


var toggleClassIfSet = function toggleClassIfSet(name) {
  return function (element) {
    return void (!element.classList.contains(name) || element.classList.toggle(name));
  };
};

var toggleClassIfNot = function toggleClassIfNot(name) {
  return function (element) {
    return void (element.classList.contains(name) || element.classList.toggle(name));
  };
};

module.exports = {
  asyncMap: asyncMap,
  compare: compare,
  delay: delay,
  filterAndReorder: filterAndReorder,
  getEntries: getEntries,
  getOtherElems: getOtherElems,
  getDeepLastIndex: getDeepLastIndex,
  isoDate: isoDate,
  isoTime: isoTime,
  jsonToDOMString: jsonToDOMString,
  jsonToFormatString: jsonToFormatString,
  keysByValue: keysByValue,
  numCombinations: numCombinations,
  noop: noop,
  offsetK: offsetK,
  relativeGrowth: relativeGrowth,
  subsplit: subsplit,
  toDecimal: toDecimal,
  uniqueOccurrences: uniqueOccurrences
};
