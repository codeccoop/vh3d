function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import MultiPolygon from "../geometries/MultiPolygon.js";
import Polygon from "../geometries/Polygon.js";
import LineString from "../geometries/LineString.js";
import Point from "../geometries/Point.js";
import Emitter from "../../mixins/Emitter.js";
var _settings = {
  data: null,
  color: 0x6cc5ce
};

function Layer(settings) {
  var _this = this;

  settings = settings || {};
  this.settings = _objectSpread(_objectSpread({}, _settings), settings);
  this.data = this.settings.data;
  delete this.settings.data;
  this.name = this.settings.name;
  delete this.settings.name;
  this.settings.side = THREE.DoubleSide;
  Emitter.asEmitter(this);
  this.parse = this.parse.bind(this);

  var _scene, _yScale, _xScale;

  Object.defineProperties(this, {
    scene: {
      get: function get() {
        return _scene;
      },
      set: function set(scene) {
        _scene = scene;

        if (_this.geometry) {
          _this.geometry.scene = scene;
        } else {
          var onGeomInit = function onGeomInit(ev) {
            ev.detail.geometry.scene = scene;
            self.$off("geometry:init", onGeomInit);
          };

          var self = _this;

          _this.$on("geometry:init", onGeomInit);
        }
      }
    },
    built: {
      get: function get() {
        return _this.geometry && _this.geometry.built;
      },
      set: function set() {
        if (_this.geometry) _this.geometry.built = false;
      }
    },
    xScale: {
      get: function get() {
        return _xScale;
      },
      set: function set(fn) {
        _xScale = fn;
        if (_this.geometry) _this.geometry.xScale = fn;
        if (_this.built) _this.build();
      }
    },
    yScale: {
      get: function get() {
        return _yScale;
      },
      set: function set(fn) {
        _yScale = fn;
        if (_this.geometry) _this.geometry.yScale = fn;
        if (_this.built) _this.build();
      }
    }
  });
}

Layer.prototype.parse = function (data) {
  data = data || this.json;
  this.json = data;
  var geomType;

  if (data.type === "Feature") {
    var _data$geometry;

    geomType = (_data$geometry = data.geometry) === null || _data$geometry === void 0 ? void 0 : _data$geometry.type;
    this.data = [data.properties];
  } else if (data.type === "FeatureCollection") {
    var _data$features$0$geom;

    geomType = data.features.length ? (_data$features$0$geom = data.features[0].geometry) === null || _data$features$0$geom === void 0 ? void 0 : _data$features$0$geom.type : null;
    this.data = data.features.map(function (d) {
      return d.properties;
    });
  } else {
    throw new Error("Unrecognized geojson format");
  }

  switch (geomType) {
    case "MultiPolygon":
      this.geometry = new MultiPolygon(this.json, this.settings);
      break;

    case "Polygon":
      this.geometry = new Polygon(this.json, this.settings);
      break;

    case "LineString":
      this.geometry = new LineString(this.json, this.settings);
      break;

    case "Point":
      this.geometry = new Point(this.json, this.settings);
      break;

    default:
      throw new Error("Unrecognized geometry");
      break;
  }

  if (this.scene) this.geometry.scene = this.scene;
  if (this.xScale) this.geometry.xScale = this.xScale;
  if (this.yScale) this.geometry.yScale = this.yScale;
  this.$emit("geometry:init", {
    geometry: this.geometry,
    layer: this
  });
  return this;
};

Layer.prototype.build = function () {
  if (this.geometry && !this.built) {
    this.geometry.worldScale = this.worldScale;
    this.geometry.build();
  }
};

Layer.prototype.render = function () {
  if (this.built) this.geometry.render();
};

Layer.prototype.localToWorld = function () {
  var width = this.bbox.get().lngs[1] - this.bbox.get().lngs[0];
  var height = this.bbox.get().lats[1] - this.bbox.get().lngs[1];
  var center = {
    x: this.bbox.get().center[0],
    y: this.bbox.get().center[1]
  };
  var origin = {
    x: center[0] - width / 2,
    y: center[1] - height / 2
  };
  var target = {
    x: origin.x + vector.x,
    y: origin.y + vector.y
  };
  var distance = {
    x: target.x - center[0],
    y: target.y - center[1]
  };
  if (distance.x === 0 && distance.y === 0) return _construct(THREE.Vector2, _toConsumableArray(center));
  var bearing = Math.atan(distance.y / distance.x);
  var radius = Math.abs(distance.y) > 0 ? distance.y / Math.sin(bearing) : Math.abs(distance.x) > 0 ? distance.x / Math.cos(bearing) : 0;
  return new THREE.Vector2(center[0]);
};

export default Layer;