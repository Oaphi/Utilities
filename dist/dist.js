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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeLastChild = exports.listContainsSome = exports.elementsLeftUntil = exports.elementsRightUntil = exports.emphasizeSelectedText = void 0;

/**
 * @typedef {object} EmphasisConfig
 * @property {HTMLInputElement} element
 * @property {string} [link]
 * @property {string} [target]
 * @property {("bold"|"italic"|"link"|"strike"|"underline")} type
 * 
 * @param {EmphasisConfig}
 * @returns {HTMLInputElement}
 */
var emphasizeSelectedText = function emphasizeSelectedText(_ref) {
  var element = _ref.element,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? "italic" : _ref$type,
      _ref$target = _ref.target,
      target = _ref$target === void 0 ? "_self" : _ref$target,
      link = _ref.link;
  var emphasis = new Map([["italic", "em"], ["bold", "strong"], ["link", "a"], ["underline", "u"], ["strike", "s"]]);
  var tag = emphasis.get(type);

  if (!tag) {
    return element;
  }

  var linkAttrs = type === "link" ? " target=\"".concat(target, "\" href=\"").concat(link, "\"") : "";
  var selectionStart = element.selectionStart,
      selectionEnd = element.selectionEnd,
      value = element.value;
  var selected = value.slice(selectionStart, selectionEnd);
  element.value = value.replace(selected, "<".concat(tag).concat(linkAttrs, ">").concat(selected, "</").concat(tag, ">"));
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

var elementsRightUntil = function elementsRightUntil(root, offset, comparator, callback, fallback) {
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
};
/**
 * @summary inverse of elementsRightUntil
 * @param {HTMLElement} root
 * @param {number} [offset]
 * @param {function(HTMLElement): boolean} comparator
 * @param {function(HTMLElement)} [callback]
 * @param {function(HTMLElement)} [fallback]
 * @param {boolean} [strict]
 */


exports.elementsRightUntil = elementsRightUntil;

var elementsLeftUntil = function elementsLeftUntil(root, offset, comparator, callback, fallback) {
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
};
/**
 * @summary checks if some tokens are contained
 * @param {DOMTokenList} list
 */


exports.elementsLeftUntil = elementsLeftUntil;

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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JSONtoQuery = JSONtoQuery;
exports.objectToQuery = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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
/**
 * @typedef {{
 *  key : string,
 *  obj : object,
 *  objectNotation : ("bracket"|"dot"),
 *  arrType : ("bracket"|"empty_bracket"|"comma")
 * }} ExpandParams
 * 
 * @summary expands object to parameter array
 * @param {ExpandParams}
 * @returns {string[]}
 */


var expandObjectToParams = function expandObjectToParams(_ref2) {
  var key = _ref2.key,
      obj = _ref2.obj,
      _ref2$encode = _ref2.encode,
      encode = _ref2$encode === void 0 ? true : _ref2$encode,
      _ref2$objectNotation = _ref2.objectNotation,
      objectNotation = _ref2$objectNotation === void 0 ? "bracket" : _ref2$objectNotation,
      _ref2$arrayNotation = _ref2.arrayNotation,
      arrayNotation = _ref2$arrayNotation === void 0 ? "bracket" : _ref2$arrayNotation;
  var paramMap = new Map([["bracket", function (k, v) {
    return "".concat(key, "[").concat(k, "]=").concat(v);
  }], ["comma", function (k, v) {
    return v;
  }], ["dot", function (k, v) {
    return "".concat(key, ".").concat(k, "=").concat(v);
  }], ["empty_bracket", function (k, v) {
    return "".concat(key, "[]=").concat(v);
  }]]);
  var isArr = Array.isArray(obj);

  if (isArr && arrayNotation === "comma") {
    return ["".concat(key, "=").concat(obj.map(function (elem) {
      return _typeof(elem) === "object" && elem ? expandObjectToParams({
        key: key,
        obj: elem,
        objectNotation: objectNotation,
        arrayNotation: arrayNotation
      }) : elem;
    }).flat().join(","))];
  }

  var ambientParamType = isArr ? arrayNotation : objectNotation;
  return Object.entries(obj).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];

    if (v === null || v === undefined) {
      return;
    }

    var isObj = _typeof(v) === "object" && v;

    if (isObj) {
      return expandObjectToParams({
        key: k,
        obj: v,
        objectNotation: objectNotation,
        arrayNotation: arrayNotation
      });
    }

    var encoded = encode ? encodeURIComponent(v) : v;
    return paramMap.has(ambientParamType) ? paramMap.get(ambientParamType)(k, encoded) : encoded;
  }).flat();
};
/**
 * @summary customizable converter from object to query string
 * 
 * @param {object} source
 * @param {{
 *  arrayNotation? : ("comma"|"bracket"|"empty_bracket"),
 *  encode?        : boolean,
 *  objectNotation?: ("bracket"|"dot")
 * }}
 * 
 * @returns {string}
 */


var objectToQuery = function objectToQuery(source) {
  var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref5$arrayNotation = _ref5.arrayNotation,
      arrayNotation = _ref5$arrayNotation === void 0 ? "bracket" : _ref5$arrayNotation,
      _ref5$objectNotation = _ref5.objectNotation,
      objectNotation = _ref5$objectNotation === void 0 ? "bracket" : _ref5$objectNotation,
      _ref5$encode = _ref5.encode,
      encode = _ref5$encode === void 0 ? true : _ref5$encode;

  var output = [];
  Object.entries(source).forEach(function (_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2),
        key = _ref7[0],
        val = _ref7[1];

    if (val === null || val === undefined) {
      return;
    }

    var isObj = _typeof(val) === "object" && val;

    if (isObj) {
      var objParams = expandObjectToParams({
        key: key,
        obj: val,
        objectNotation: objectNotation,
        arrayNotation: arrayNotation,
        encode: encode
      });
      return output.push.apply(output, _toConsumableArray(objParams));
    }

    output.push("".concat(key, "=").concat(val));
  });
  return output.join("&");
};

exports.objectToQuery = objectToQuery;
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
    root.Validator = factory();
  }
})(typeof self !== 'undefined' ? self : void 0, function () {
  /**
   * @summary validates JSON object
   * @param {object} schema
   */
  var validateJSON = function validateJSON(schema) {
    return (
      /**
       * @param {object} json
       * @returns {boolean}
       */
      function (json) {
        try {
          //draft 1: validates only top-level property
          return Object.entries(json).every(function (entry) {
            var _entry = _slicedToArray(entry, 2),
                key = _entry[0],
                val = _entry[1];

            if (_typeof(val) === "object" && val !== null) {
              return validateJSON(schema)(val);
            }

            var _schema$additionalPro = schema.additionalProperties,
                additionalProperties = _schema$additionalPro === void 0 ? true : _schema$additionalPro,
                properties = schema.properties;
            var descriptor = properties[key]; //no descriptor and disallowed extra props -> invalid

            if (!descriptor && !additionalProperties) {
              return false;
            } //no descriptor and extra prop -> any valid


            if (!descriptor) {
              return true;
            }

            var enumerable = descriptor["enum"],
                maxLength = descriptor.maxLength,
                minLength = descriptor.minLength,
                type = descriptor.type;
            var isEnumValid = enumerable ? enumerable.some(function (v) {
              return v === val;
            }) : true;
            var isNullValid = type === null ? val === null : true;
            var isTypeValid = type ? _typeof(val) === type : true;
            var isMinMaxValid = typeof val === "string" ? (!minLength || val.length >= minLength) && (!maxLength || val.length <= maxLength) : true;
            var isValid = isTypeValid && isNullValid && isEnumValid && isMinMaxValid;
            return isValid;
          });
        } catch (error) {
          return false;
        }
      }
    );
  };

  return {
    validateJSON: validateJSON
  };
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqify = exports.unionGrids = exports.validateGrid = exports.splitIntoConseq = exports.spliceInto = exports.shrinkGrid = exports.removeElements = exports.reduceWithStep = exports.mergeOnto = exports.mapUntil = exports.longest = exports.last = exports.keyMap = exports.forAll = exports.foldGrid = exports.filterMapped = exports.filterMap = exports.deduplicate = exports.countObjects = exports.closestValue = exports.chunkify = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

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


exports.chunkify = chunkify;

var filterMap = function filterMap() {
  var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return function () {
    var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
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


exports.filterMap = filterMap;

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
 * @typedef {{
 *  upToMatching ?: (any) => boolean,
 *  upToIndex    ?: number,
 *  source       ?: any[],
 *  mapper       ?: function,
 *  onError      ?: (err : Error) => void
 * }} MapUntilOptions
 * 
 * @param {MapUntilOptions}
 * @returns {any[]}
 */


exports.filterMapped = filterMapped;

var mapUntil = function mapUntil() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      upToMatching = _ref2.upToMatching,
      upToIndex = _ref2.upToIndex,
      _ref2$source = _ref2.source,
      source = _ref2$source === void 0 ? [] : _ref2$source,
      _ref2$mapper = _ref2.mapper,
      mapper = _ref2$mapper === void 0 ? function (v) {
    return v;
  } : _ref2$mapper,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError;

  try {
    var mapped = [];

    for (var i = 0; i < source.length; i++) {
      var element = source[i];

      if (i >= upToIndex || typeof upToMatching === "function" && upToMatching(element)) {
        break;
      }

      mapped[i] = mapper(element);
    }

    return mapped;
  } catch (error) {
    onError(error);
    return source;
  }
};
/**
 * @summary returns last element of array
 * @param {any[]} array
 * @returns {any} 
 */


exports.mapUntil = mapUntil;

var last = function last(array) {
  return array[array.length - 1];
};
/**
 * Executes a callback for each element
 * (same as forEach, but in FP style + faster)
 * @param {any[]} [array]
 * @returns {function(function):void} 
 */


exports.last = last;

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


exports.forAll = forAll;

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


exports.keyMap = keyMap;

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


exports.mergeOnto = mergeOnto;

var reduceWithStep = function reduceWithStep(_ref3) {
  var _ref3$source = _ref3.source,
      source = _ref3$source === void 0 ? [] : _ref3$source,
      callback = _ref3.callback,
      _ref3$step = _ref3.step,
      step = _ref3$step === void 0 ? 1 : _ref3$step,
      initial = _ref3.initial;
  return source.reduce(function (acc, curr, i) {
    return i % step ? acc : callback(acc, curr, i + step - 1, source);
  }, initial || source[0]);
};

exports.reduceWithStep = reduceWithStep;

var unionGrids = function unionGrids() {
  var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref4$sources = _ref4.sources,
      sources = _ref4$sources === void 0 ? [] : _ref4$sources,
      _ref4$hasher = _ref4.hasher,
      hasher = _ref4$hasher === void 0 ? function (v) {
    return v === "" ? "" : JSON.stringify(v);
  } : _ref4$hasher;

  var hashes = new Set();
  var output = sources.reduce(function (acc, cur) {
    var added = cur.reduce(function (a, row) {
      var h = hasher(row);

      if (!hashes.has(h)) {
        a.push(row);
        hashes.add(h);
      }

      return a;
    }, []);
    return [].concat(_toConsumableArray(acc), _toConsumableArray(added));
  }, []);

  if (!output.length) {
    output.push([]);
  }

  return output;
};
/**
 * @typedef {object} ExpandGridOptions
 * @property {any[][]} source
 * @property {number|string|boolean|undefined|null} fill
 * @property {number} [horizontally]
 * @property {number} [vertically]
 * 
 * @param {ExpandGridOptions}
 */


exports.unionGrids = unionGrids;

var expandGrid = function expandGrid() {//TODO: add utility

  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      source = _ref5.source,
      _ref5$vertically = _ref5.vertically,
      vertically = _ref5$vertically === void 0 ? 0 : _ref5$vertically,
      _ref5$horizontally = _ref5.horizontally,
      horizontally = _ref5$horizontally === void 0 ? 0 : _ref5$horizontally,
      fill = _ref5.fill;
};
/**
 * @typedef {} InsertInGridOptions
 */


var insertInGrid = function insertInGrid() {//TODO: add utility

  var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      source = _ref6.source;
};
/**
 * @typedef {{
 *  source ?: any[][],
 *  accumulator ?: any,
 *  callback ?: (acc : any, cur : any) => any,
 *  overColumn ?: number
 * }} FoldGridOptions
 * 
 * @param {FoldGridOptions}
 */


var foldGrid = function foldGrid() {
  var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref7$source = _ref7.source,
      source = _ref7$source === void 0 ? [[]] : _ref7$source,
      _ref7$accumulator = _ref7.accumulator,
      accumulator = _ref7$accumulator === void 0 ? 0 : _ref7$accumulator,
      _ref7$callback = _ref7.callback,
      callback = _ref7$callback === void 0 ? function (acc) {
    return acc += 1;
  } : _ref7$callback,
      _ref7$overColumn = _ref7.overColumn,
      overColumn = _ref7$overColumn === void 0 ? 0 : _ref7$overColumn,
      _ref7$matching = _ref7.matching,
      matching = _ref7$matching === void 0 ? function () {
    return true;
  } : _ref7$matching,
      _ref7$onError = _ref7.onError,
      onError = _ref7$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref7$onError;

  try {
    var column = source.map(function (row) {
      return row[overColumn];
    });
    return column.reduce(function (acc, cur, ri) {
      if (matching(cur, column)) {
        return callback(acc, cur, source[ri]);
      }

      return acc;
    }, accumulator);
  } catch (error) {
    onError(error);
  }
};
/**
 * @typedef {object} ShrinkGridOptions
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
 * @param {ShrinkGridOptions} [source]
 */


exports.foldGrid = foldGrid;

var shrinkGrid = function shrinkGrid() {
  var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref8$vertically = _ref8.vertically,
      vertically = _ref8$vertically === void 0 ? 0 : _ref8$vertically,
      source = _ref8.source,
      _ref8$top = _ref8.top,
      top = _ref8$top === void 0 ? 0 : _ref8$top,
      _ref8$right = _ref8.right,
      right = _ref8$right === void 0 ? 0 : _ref8$right,
      _ref8$left = _ref8.left,
      left = _ref8$left === void 0 ? 0 : _ref8$left,
      _ref8$leave = _ref8.leave,
      leave = _ref8$leave === void 0 ? {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  } : _ref8$leave,
      _ref8$horizontally = _ref8.horizontally,
      horizontally = _ref8$horizontally === void 0 ? 0 : _ref8$horizontally,
      _ref8$bottom = _ref8.bottom,
      bottom = _ref8$bottom === void 0 ? 0 : _ref8$bottom,
      _ref8$all = _ref8.all,
      all = _ref8$all === void 0 ? 0 : _ref8$all;

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


exports.shrinkGrid = shrinkGrid;

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


exports.spliceInto = spliceInto;

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


exports.splitIntoConseq = splitIntoConseq;

var countObjects = function countObjects() {
  var _ref9 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref9$source = _ref9.source,
      source = _ref9$source === void 0 ? [] : _ref9$source,
      onKey = _ref9.onKey;

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


exports.countObjects = countObjects;

var deduplicate = function deduplicate() {
  var _ref10 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref10$ignore = _ref10.ignore,
      ignore = _ref10$ignore === void 0 ? {} : _ref10$ignore,
      _ref10$source = _ref10.source,
      source = _ref10$source === void 0 ? [] : _ref10$source,
      _ref10$type = _ref10.type,
      type = _ref10$type === void 0 ? "entries" : _ref10$type;

  var toDedupe = source.map(function (obj) {
    return obj;
  }).reverse();
  var length = toDedupe.length;
  var _ignore$keys = ignore.keys,
      keys = _ignore$keys === void 0 ? [] : _ignore$keys;
  return source.filter(function (srcObj, srcIdx) {
    var srcEntries = Object.entries(srcObj).filter(function (_ref11) {
      var _ref12 = _slicedToArray(_ref11, 1),
          k = _ref12[0];

      return !keys.includes(k);
    });
    var lastIdx = toDedupe.findIndex(function (tgtObj) {
      var tgtEntries = Object.entries(tgtObj).filter(function (_ref13) {
        var _ref14 = _slicedToArray(_ref13, 1),
            k = _ref14[0];

        return !keys.includes(k);
      });

      if (tgtEntries.length !== srcEntries.length) {
        return false;
      }

      var sameOnEntries = type === "entries" && tgtEntries.every(function (_ref15) {
        var _ref16 = _slicedToArray(_ref15, 2),
            key = _ref16[0],
            val = _ref16[1];

        return srcObj[key] === val;
      });
      var sameOnValues = type === "values" && tgtEntries.map(function (_ref17) {
        var _ref18 = _slicedToArray(_ref17, 2),
            v = _ref18[1];

        return v;
      }).every(function (tgtVal) {
        return Object.values(srcObj).includes(tgtVal);
      });
      var sameOnKeys = type === "keys" && tgtEntries.map(function (_ref19) {
        var _ref20 = _slicedToArray(_ref19, 1),
            k = _ref20[0];

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


exports.deduplicate = deduplicate;

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


exports.closestValue = closestValue;

var removeElements = function removeElements(arr) {
  for (var _len3 = arguments.length, elems = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    elems[_key3 - 1] = arguments[_key3];
  }

  return arr.filter(function (elem) {
    return !elems.includes(elem);
  });
};
/**
 * @summary validates a grid of value
 * 
 * @param {{
 *  without : (any|undefined),
 *  grid : any[][],
 *  has : (any|undefined),
 *  minCols : (number|undefined),
 *  minRows : (number|undefined),
 *  notBlank : (boolean|false),
 *  notEmpty : (boolean|false),
 *  notFull : (boolean|false)
 * }} 
 * 
 * @returns {boolean}
 */


exports.removeElements = removeElements;

var validateGrid = function validateGrid() {
  var _ref21 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref21$grid = _ref21.grid,
      grid = _ref21$grid === void 0 ? [[]] : _ref21$grid,
      has = _ref21.has,
      without = _ref21.without,
      blank = _ref21.blank,
      _ref21$notBlank = _ref21.notBlank,
      notBlank = _ref21$notBlank === void 0 ? false : _ref21$notBlank,
      _ref21$notEmpty = _ref21.notEmpty,
      notEmpty = _ref21$notEmpty === void 0 ? false : _ref21$notEmpty,
      _ref21$notFilled = _ref21.notFilled,
      notFilled = _ref21$notFilled === void 0 ? false : _ref21$notFilled,
      minCols = _ref21.minCols,
      minRows = _ref21.minRows;

  var length = grid.length;

  if (!length) {
    throw new RangeError("Grid must have at least one row");
  }

  var validRows = minRows || length;

  if (length < validRows) {
    return false;
  }

  var _grid = _slicedToArray(grid, 1),
      firstRowLength = _grid[0].length;

  if (notEmpty && !firstRowLength) {
    return false;
  }

  var validCols = minCols || firstRowLength;

  if (firstRowLength < validCols) {
    return false;
  }

  var numEmpty = 0,
      numFilled = 0,
      matchOnVal = 0;
  var gridValidated = grid.every(function (row) {
    return row.every(function (cell) {
      var notContains = without !== undefined ? cell !== without : true;

      if (!notContains) {
        return false;
      }

      cell === "" ? numEmpty++ : numFilled++;
      cell === has && (matchOnVal |= 1);
      return true;
    });
  });
  var blankValid = blank !== undefined ? !numFilled === blank : true;
  return gridValidated && blankValid && (!notFilled || !!numEmpty) && (!notBlank || !!numFilled) && (has === undefined || !!matchOnVal);
};
/**
 * @summary finds longest array in a grid
 * @param {any[][]} grid
 * @returns {number}
 */


exports.validateGrid = validateGrid;

var longest = function longest(grid) {
  return Math.max.apply(Math, _toConsumableArray(grid.map(function (_ref22) {
    var length = _ref22.length;
    return length;
  })));
};
/**
 * @summary leaves only unique elements (shallow)
 * @param {any[]} [arr]
 * @returns {any[]}
 */


exports.longest = longest;

var uniqify = function uniqify() {
  var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return _toConsumableArray(new Set(arr).values());
};

exports.uniqify = uniqify;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withInterval = exports.waitAsync = exports.forEachAwait = exports.forAwait = void 0;

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
/**
 * @typedef {{
 *  interval? : number,
 *  callback : function () : Promise,
 *  stopIf? : boolean,
 *  times? : number
 * }} IntervalConfig
 * 
 * @param {IntervalConfig}
 */


exports.forEachAwait = forEachAwait;

var withInterval = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
    var _ref4$interval, interval, callback, _ref4$times, times, _ref4$stopIf, stopIf, result;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ref4$interval = _ref4.interval, interval = _ref4$interval === void 0 ? 4 : _ref4$interval, callback = _ref4.callback, _ref4$times = _ref4.times, times = _ref4$times === void 0 ? 1 : _ref4$times, _ref4$stopIf = _ref4.stopIf, stopIf = _ref4$stopIf === void 0 ? function () {
              return false;
            } : _ref4$stopIf;

            if (times) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return");

          case 3:
            _context3.next = 5;
            return callback();

          case 5:
            result = _context3.sent;

            if (!stopIf(result)) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", result);

          case 8:
            return _context3.abrupt("return", new Promise(function (res, rej) {
              var timesLeft = times - 1;
              setTimeout(function () {
                return withInterval({
                  interval: interval,
                  callback: callback,
                  times: timesLeft,
                  stopIf: stopIf
                }).then(res)["catch"](rej);
              }, interval);
            }));

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function withInterval(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.withInterval = withInterval;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.yesterday = exports.toISO8601Timestamp = exports.offset = exports.dateDiff = exports.buildTime = void 0;

/**
 * @fileoverview Date utility functions
 * @author Oleg Valter
 * @license MIT
 */

/**
 * @summary calculates difference between 2 dates (in 24-hour based days)
 * @param {Date|number|string} a 
 * @param {Date|number|string} b 
 */
var dateDiff = function dateDiff(a, b) {
  return Math.abs(Math.floor((new Date(a) - new Date(b)) / 864e5));
};
/**
 * @summary builds time string from hours and minutes config
 * @param {{
 *  hours?   : number
 *  minutes? : number
 * }}
 * @returns {string}
 */


exports.dateDiff = dateDiff;

var buildTime = function buildTime() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$hours = _ref.hours,
      hours = _ref$hours === void 0 ? 0 : _ref$hours,
      _ref$minutes = _ref.minutes,
      minutes = _ref$minutes === void 0 ? 0 : _ref$minutes;

  var over = minutes > 59 ? Math.floor(minutes / 60) || 1 : 0;
  var hh = hours + over;
  var mm = over ? minutes - over * 60 : minutes;
  return "".concat(hh < 10 ? "0".concat(hh) : hh, ":").concat(mm < 10 ? "0".concat(mm) : mm);
};
/**
 * @summary converts a date-like value to ISO 8601 timestamp
 * @param {number|string|Date} [date] 
 * @returns {string}
 */


exports.buildTime = buildTime;

var toISO8601Timestamp = function toISO8601Timestamp() {
  var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
  var parsed = new Date(date);
  var MIN_IN_HOUR = 60;
  var hours = parsed.getTimezoneOffset() / MIN_IN_HOUR;
  var fraction = (hours - Number.parseInt(hours)) * MIN_IN_HOUR;
  var sign = hours < 0 ? "-" : "+";
  var offset = "".concat(sign).concat("".concat(Math.abs(hours)).padStart(2, "0"), ":").concat("".concat(fraction).padEnd(2, "0"));
  return parsed.toISOString().slice(0, -5) + offset;
};
/**
 * @summary offsets a date-like value to day before
 * @param {number|string|Date} [date]
 * @returns {Date}
 */


exports.toISO8601Timestamp = toISO8601Timestamp;

var yesterday = function yesterday() {
  var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
  var parsed = new Date(date);
  var MIL_IN_DAY = 864e5;
  return new Date(parsed - MIL_IN_DAY);
};
/**
 * @typedef {{
 *  date?   : number|string|Date,
 *  numberOf?: number,
 *  onError?: (err : Error) => void,
 *  period?: "days"|"months"|"years"
 * }} OffsetOptions
 * 
 * @param {OffsetOptions}
 * @returns {Date}
 */


exports.yesterday = yesterday;

var offset = function offset() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$date = _ref2.date,
      date = _ref2$date === void 0 ? Date.now() : _ref2$date,
      _ref2$numberOf = _ref2.numberOf,
      numberOf = _ref2$numberOf === void 0 ? 1 : _ref2$numberOf,
      _ref2$period = _ref2.period,
      period = _ref2$period === void 0 ? "days" : _ref2$period,
      _ref2$onError = _ref2.onError,
      onError = _ref2$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref2$onError;

  try {
    var parsed = new Date(date);
    var MIL_IN_DAY = 864e5;
    /** @type {Map<string,(d : Date, n : number) => Date>} */

    var periodMap = new Map([["days", function (date, n) {
      return new Date(date.valueOf() - MIL_IN_DAY * n);
    }], ["months", function (date, n) {
      return new Date(date.getFullYear(), date.getMonth() - n, date.getDate());
    }], ["years", function (date, n) {
      return new Date(date.getFullYear() - n, date.getMonth(), date.getDate());
    }]]);
    return periodMap.get(period)(parsed, numberOf);
  } catch (error) {
    onError(error);
    return new Date(date);
  }
};

exports.offset = offset;
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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeEnum = exports.defineConstant = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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


exports.defineConstant = defineConstant;

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
        //always explicityl convert to string as Symbols cannot be coerced
        throw new RangeError("Invalid enum property: ".concat(key.toString()));
      }

      return target[key];
    }
  });
};

exports.makeEnum = makeEnum;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchConfig = FetchConfig;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * @typedef {{
 *  contentType : ("application/json"),
 *  domain : string,
 *  method : ("GET"|"POST"|"PUT"|"DELETE"|"OPTIONS"),
 *  redirect : (boolean|true),
 *  paths : string[],
 *  payload : (Object.<string, any>|undefined),
 *  subdomains : string[],
 *  query : Object.<string, string>
 * }} FetchSettings
 * 
 * @typedef {{
 *  base : string,
 *  domain : string,
 *  method : ("GET"|"POST"|"PUT"|"DELETE"|"OPTIONS"),
 *  path : string,
 *  paths : string[],
 *  payload : (string|object|null),
 *  search : string,
 *  subdomains : string[],
 *  type : ("application/json"|"multipart/form-data"|"text/plain"|"application/x-www-form-urlencoded"),
 *  query : Object.<string, string>,
 *  url : string,
 *  addHeader : function (string, string) : FetchConfigurer,
 *  addHeaders : function (Object.<string, string>) : FetchConfigurer,
 *  addParam : function (string, any) : FetchConfigurer,
 *  addPaths : function (...string) : FetchConfigurer,
 *  getJSONPayload : function () : string,
 *  getUrlPayload : function () : string, 
 *  removeHeader : function (string) : FetchConfigurer,
 *  json : function (Object.<string, string>) : object
 * }} FetchConfigurer
 * 
 * @summary configures request
 * @param {FetchSettings}
 * @returns {FetchConfigurer}
 */
function FetchConfig() {
  var _this = this;

  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$contentType = _ref.contentType,
      contentType = _ref$contentType === void 0 ? "application/json" : _ref$contentType,
      domain = _ref.domain,
      _ref$method = _ref.method,
      method = _ref$method === void 0 ? "GET" : _ref$method,
      _ref$subdomains = _ref.subdomains,
      subdomains = _ref$subdomains === void 0 ? [] : _ref$subdomains,
      _ref$payload = _ref.payload,
      payload = _ref$payload === void 0 ? null : _ref$payload,
      _ref$redirect = _ref.redirect,
      redirect = _ref$redirect === void 0 ? true : _ref$redirect,
      _ref$paths = _ref.paths,
      paths = _ref$paths === void 0 ? [] : _ref$paths,
      query = _ref.query;

  var AllowedMethods = new Set(["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
  var AllowedTypes = new Set(["application/json", "multipart/form-data", "text/plain", "application/x-www-form-urlencoded"]);
  var fetch = {
    method: method,
    payload: payload,
    redirect: redirect,
    type: contentType
  };
  var headers = new Map([["Content-Type", contentType]]);
  /**
   * @summary generic configurer prepare utility
   * @param {FetchConfigurer} configurer
   * @param {Object.<string,string>} mapping 
   * @returns {object}
   */

  var prepareConfig = function prepareConfig(configurer, mapping) {
    var method = configurer.method,
        url = configurer.url;
    var redirect = fetch.redirect;
    var config = {};

    if (!mapping) {
      config.method = method;
      config.headers = Object.fromEntries(headers);
      config.redirect = redirect ? "follow" : "manual"; //default to Fetch API choice

      config.url = url;
      return config;
    }

    Object.entries(mapping).forEach(function (_ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          mappedKey = _ref3[0],
          mapTo = _ref3[1];

      return config[mapTo] = mappedKey in _this ? _this[mappedKey] : fetch[mappedKey];
    });
    return config;
  };

  var configurer = Object.seal({
    domain: domain,
    headers: headers,
    paths: paths,
    subdomains: subdomains,
    query: query,

    /**
     * @summary getter for full base URI
     * @returns {string}
     */
    get base() {
      var subdomains = this.subdomains,
          domain = this.domain;
      var base = [].concat(_toConsumableArray(subdomains), [domain]);
      return base.join(".");
    },

    /**
     * @summary getter for method
     * @returns {string}
     */
    get method() {
      var method = fetch.method;
      return method;
    },

    /**
     * @summary setter for method
     * @param {("GET"|"POST"|"PUT"|"DELETE"|"OPTIONS")} newMethod
     * @returns {string}
     */
    set method(newMethod) {
      var ucased = newMethod.toUpperCase();
      var validated = AllowedMethods.has(ucased) ? ucased : "GET";
      return fetch.method = validated;
    },

    /**
     * @summary getter for full path
     * @returns {string}
     */
    get path() {
      var paths = this.paths;
      var path = paths.join("/");
      return path ? "/".concat(path) : "";
    },

    /**
     * @summary payload getter (if method is not GET)
     * @returns {?(string|object)}
     */
    get payload() {
      var method = fetch.method,
          payload = fetch.payload;
      return method !== "GET" ? payload : null;
    },

    /**
     * @summary setter for payload
     * @param {object} value
     * @returns {object}
     */
    set payload(value) {
      if (value === undefined || value === null) {
        return value;
      }

      var method = this.method;
      fetch.payload = value;

      if (method === "GET") {
        this.method = "POST";
      }

      return value;
    },

    /**
     * @summary getter for query string (including "?")
     * @returns {string}
     */
    get search() {
      var query = this.query;
      return query ? "?".concat(FetchConfig.toQuery(query)) : "";
    },

    /**
     * @summary getter for content type
     * @returns {string}
     */
    get type() {
      var type = fetch.type;
      return type;
    },

    /**
     * @summary setter for content type
     * @param {string} value
     * @returns {string}
     */
    set type(value) {
      var validType = AllowedTypes.has(value) ? value : "application/json";
      fetch.type = validType;
      headers.set("Content-Type", validType);
      return value;
    },

    /**
     * @summary getter for full URI (https only)
     * @returns {string}
     */
    get url() {
      var base = this.base,
          path = this.path,
          search = this.search;
      var protocol = /^https:\/\//.test(base) ? "" : "https://";
      return "".concat(protocol).concat(base).concat(path).concat(search);
    },

    /**
     * @summary add header to list of headers
     * @param {string} key 
     * @param {string} value
     */
    addHeader: function addHeader(key, value) {
      headers.set(key, value);
      return this;
    },

    /**
     * @summary adds headers from map
     * @param {object} [mapper] 
     */
    addHeaders: function addHeaders() {
      var mapper = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      Object.entries(mapper).forEach(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            name = _ref5[0],
            val = _ref5[1];

        headers.set(name, val);
      });
      return this;
    },

    /**
     * @summary removes a header
     * @param {string} key 
     */
    removeHeader: function removeHeader(key) {
      headers["delete"](key);
      return this;
    },

    /**
     * @summary gets payload as x-www-form-urlencoded
     * @returns {string}
     */
    getUrlPayload: function getUrlPayload() {
      var payload = this.payload;
      var form = FetchConfig.toQuery(payload);
      var encoded = encodeURI(form);
      /** @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI} */

      return encoded.replace(/\%5(B|D)/g, function (full, type) {
        return type === "B" ? "[" : "]";
      });
    },

    /**
     * @summary gets payload as application/json
     * @returns {string}
     */
    getJSONPayload: function getJSONPayload() {
      var payload = this.payload;
      return payload ? JSON.stringify(payload) : "";
    },

    /**
     * @summary adds parameter to query
     * @param {string} key 
     * @param {*} value 
     * @returns {FetchAppConfigurer}
     */
    addParam: function addParam(key, value) {
      var query = this.query;
      this.query = FetchConfig.union(query, _defineProperty({}, key, value));
      return this;
    },

    /**
     * @summary adds path part
     * @param {...string} pathsToAdd 
     * @returns {FetchAppConfigurer}
     */
    addPaths: function addPaths() {
      var paths = this.paths;
      paths.push.apply(paths, arguments);
      return this;
    },

    /**
     * @summary prepares config as JSON
     * @param {Object.<string, string>} [mapping]
     * @returns {object}
     */
    json: function json(mapping) {
      var config = prepareConfig(this, mapping);
      var method = this.method;

      if (method === "GET") {
        return config;
      }

      var payload = this.getJSONPayload();
      var shouldMap = mapping && "payload" in mapping;
      shouldMap && (config[mapping.payload] = payload) || (config.body = payload);
      return config;
    }
  });
  configurer.method = method;
  configurer.payload = payload;
  return configurer;
}
/**
 * @summary sets object union utility
 * @param {function (object, ...object) : object} unionizer
 * @returns {FetchConfig}
 */


FetchConfig.setUnionizer = function (unionizer) {
  console.log("injected object union dependency");
  Object.defineProperty(FetchConfig, "union", {
    configurable: false,
    writable: false,
    value: unionizer
  });
  return FetchConfig;
};
/**
 * @summary sets JSON to query dependency
 * @param {function (object) : string} jsonToQueryUtil 
 * @returns {FetchConfig}
 */


FetchConfig.setToQuery = function (jsonToQueryUtil) {
  console.log("injected JSON to query dependency");
  Object.defineProperty(FetchConfig, "toQuery", {
    configurable: false,
    writable: false,
    value: jsonToQueryUtil
  });
  return FetchConfig;
};
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
exports.whichKeysAreSet = exports.whichKeyIsSet = exports.union = exports.switchIfDiffProp = exports.smartGetter = exports.shallowFilter = exports.setIf = exports.pushOrInitProp = exports.isObject = exports.isObj = exports.getOrInitProp = exports.getGetterDescriptors = exports.fromPath = exports.deepParseByPath = exports.deepMap = exports.deepGetByType = exports.deepFilter = exports.deepCopy = exports.deepAssign = exports.complement = exports.objectArrayToDict = void 0;

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
/**
 * @summary type guard for proper objects
 * @param {any} [obj]
 * @returns {boolean}
 */


exports.shallowFilter = shallowFilter;

var isObj = function isObj(obj) {
  return _typeof(obj) === "object" && obj;
};
/**
 * @summary deep copies an object
 * @param {{ 
 *   source : object|Array, 
 *   skip? : string[] 
 * }}
 * @returns {object|Array}
 */


exports.isObj = isObj;

var deepCopy = function deepCopy() {
  var _ref13 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref13$source = _ref13.source,
      source = _ref13$source === void 0 ? {} : _ref13$source,
      _ref13$skip = _ref13.skip,
      skip = _ref13$skip === void 0 ? [] : _ref13$skip;

  var output = Array.isArray(source) ? [] : {};
  Object.entries(source).forEach(function (_ref14) {
    var _ref15 = _slicedToArray(_ref14, 2),
        key = _ref15[0],
        val = _ref15[1];

    if (skip.includes(key)) {
      return;
    }

    output[key] = isObj(val) ? deepCopy({
      source: val,
      skip: skip
    }) : val;
  });
  return output;
};
/**
 * @summary deep assigns object props
 * @param {{
 *  source?   : object,
 *  updates?  : object[],
 *  objGuard? : (any) => boolean,
 *  onError?  : console.warn
 * }} 
 * @returns {object}
 */


exports.deepCopy = deepCopy;

var deepAssign = function deepAssign() {
  var _ref16 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref16$source = _ref16.source,
      source = _ref16$source === void 0 ? {} : _ref16$source,
      _ref16$updates = _ref16.updates,
      updates = _ref16$updates === void 0 ? [] : _ref16$updates,
      _ref16$objGuard = _ref16.objGuard,
      objGuard = _ref16$objGuard === void 0 ? function (obj) {
    return _typeof(obj) === "object" && obj;
  } : _ref16$objGuard,
      _ref16$onError = _ref16.onError,
      onError = _ref16$onError === void 0 ? console.warn : _ref16$onError;

  try {
    return updates.reduce(function (ac, up) {
      var entries = Object.entries(up);
      var objEntries = entries.filter(function (_ref17) {
        var _ref18 = _slicedToArray(_ref17, 2),
            _ = _ref18[0],
            v = _ref18[1];

        return objGuard(v);
      });
      var restEntries = entries.filter(function (_ref19) {
        var _ref20 = _slicedToArray(_ref19, 2),
            _ = _ref20[0],
            v = _ref20[1];

        return !objGuard(v);
      });
      Object.assign(source, Object.fromEntries(restEntries));
      objEntries.reduce(function (a, _ref21) {
        var _ref22 = _slicedToArray(_ref21, 2),
            k = _ref22[0],
            v = _ref22[1];

        return a[k] = deepAssign({
          source: a[k] || {},
          updates: [v]
        });
      }, ac);
      return ac;
    }, source);
  } catch (error) {
    onError(error);
  }

  return source;
};
/**
 * @summary parse an object from path and value
 * @param {{
 *  path   : string,
 *  value ?: any
 * }} [options]
 * @return {object} 
 */


exports.deepAssign = deepAssign;

var fromPath = function fromPath() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$path = options.path,
      path = _options$path === void 0 ? "" : _options$path,
      value = options.value;
  var output = {};
  path.split(/\/|\\/).reduce(function (a, c, i, paths) {
    return a[c] = i < paths.length - 1 || !("value" in options) ? {} : value;
  }, output);
  return output;
};
/**
 * @typedef {{
 *  source  ?: any[],
 *  keys    ?: string,
 *  values  ?: string,
 *  onError ?: (err : Error) => void
 * }} ArrayToDictoptions
 * 
 * @param {ArrayToDictoptions}
 */


exports.fromPath = fromPath;

var objectArrayToDict = function objectArrayToDict() {
  var _ref23 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref23$source = _ref23.source,
      source = _ref23$source === void 0 ? [] : _ref23$source,
      keys = _ref23.keys,
      values = _ref23.values,
      _ref23$onError = _ref23.onError,
      onError = _ref23$onError === void 0 ? function (err) {
    return console.warn(err);
  } : _ref23$onError;

  var output = {};

  try {
    source.forEach(function (elem) {
      var _Object$entries$ = _slicedToArray(Object.entries(elem)[0], 2),
          defaultKey = _Object$entries$[0],
          defaultVal = _Object$entries$[1];

      var key = elem[keys || defaultKey];
      var val = values ? elem[values] : defaultVal;
      output[key] = val;
    });
  } catch (error) {
    onError(error);
  }

  return output;
};

exports.objectArrayToDict = objectArrayToDict;
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
