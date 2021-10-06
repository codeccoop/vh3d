function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import BBox from "../components/BBox.js";
import { RelativeScale } from "../components/Scales.js";
import Emitter from "../../mixins/Emitter.js";
var _settings = {
  color: 0x6cc5ce,
  z: null
};

function Geometry(json, settings) {
  var _arguments = arguments,
      _this = this;

  this.json = json;
  settings = settings || {};
  this.settings = _objectSpread(_objectSpread({}, _settings), settings);
  this.bbox = new BBox(json.features, settings.z, settings.projection);
  var bbox = this.bbox.get();
  var canvas = document.getElementById("canvas");

  if (canvas.clientWidth < canvas.clientHeight) {
    var percent = canvas.clientHeight / canvas.clientWidth - 1;
    var delta = bbox.lats[1] - bbox.lats[0];
    var xRange = bbox.lngs;
    var yRange = [bbox.lats[0] - delta * percent * 0.5, bbox.lats[1] - delta * percent * 0.5];
    this.xScale = this.xScale || new RelativeScale(xRange, [0, canvas.clientWidth]);
    this.yScale = this.yScale || new RelativeScale(yRange, [0, canvas.clientHeight]);
  } else {
    var _percent = canvas.clientWidth / canvas.clientHeight - 1;

    var _delta = bbox.lngs[1] - bbox.lngs[0];

    var _xRange = [bbox.lngs[0] - _delta * _percent * 0.5, bbox.lngs[1] + _delta * _percent * 0.5];
    var _yRange = bbox.lngs;
    this.xScale = this.xScale || new RelativeScale(_xRange, [0, canvas.clientWidth]);
    this.yScale = this.yScale || new RelativeScale(_yRange, [0, canvas.clientHeight]);
  }

  this.material = this.Material(settings);
  var _build = this.build;

  this.build = function () {
    _this.scale();

    _build.apply(_this, _arguments);

    _this.built = true;

    _this.$emit("build", {
      geometry: _this
    });
  };

  this.shapes = new Array();
  Emitter.asEmitter(this);
}

Geometry.prototype.scale = function () {
  var _this2 = this;

  var _iterator = _createForOfIteratorHelper(this.json.features),
      _step;

  try {
    var _loop = function _loop() {
      var feat = _step.value;
      if (feat.properties.rescaled) return "continue";
      var type = feat.geometry.type;

      if (type === "Point") {
        feat.geometry.coordinates = [_this2.xScale(feat.geometry.coordinates[0]), _this2.yScale(feat.geometry.coordinates[1])];
      } else if (type === "LineString") {
        feat.geometry.coordinates = feat.geometry.coordinates.map(function (coord) {
          return [_this2.xScale(coord[0]), _this2.yScale(coord[1])];
        });
      } else if (type === "Polygon") {
        feat.geometry.coordinates.forEach(function (segment, i) {
          feat.geometry.coordinates[i] = segment.map(function (coord) {
            return [_this2.xScale(coord[0]), _this2.yScale(coord[1])];
          });
        });
      } else if (type === "MultiPolygon") {
        feat.geometry.coordinates.forEach(function (poly, i) {
          poly.forEach(function (segment, j) {
            feat.geometry.coordinates[i][j] = segment.map(function (coord) {
              return [_this2.xScale(coord[0]), _this2.yScale(coord[1])];
            });
          });
        });
      }

      feat.properties.rescaled = true;
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ret = _loop();

      if (_ret === "continue") continue;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

Geometry.prototype.build = function () {};

Geometry.prototype.render = function () {
  if (!this.scene) {
    throw new Error("Scene must be binded before render");
  }

  var _iterator2 = _createForOfIteratorHelper(this.shapes),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var shape = _step2.value;
      this.scene.add(shape);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
};

Geometry.prototype.Shape = THREE.Shape;

Geometry.prototype.Geometry = function (shape, settings) {
  if (settings.z != null) {
    return new THREE.ExtrudeGeometry(shape, _objectSpread({
      bevelEnabled: false
    }, settings));
  } else {
    return new THREE.ShapeGeometry(shape, settings);
  }
};

Geometry.prototype.Mesh = THREE.Mesh;

Geometry.prototype.Material = function (settings) {
  return new THREE.MeshToonMaterial(settings);
};

Geometry.prototype.buildUVSurface = function (map, geometry, xSegments, ySegments, z) {
  xSegments = xSegments || 1;
  ySegments = ySegments || 1;
  var bbox = this.bbox.get();
  var lngs = [this.xScale(bbox.lngs[0]), this.xScale(bbox.lngs[1])];
  var lats = [this.yScale(bbox.lats[0]), this.yScale(bbox.lats[1])];
  var plane = new THREE.PlaneGeometry(lngs[1] - lngs[0], lats[1] - lats[0], 1, 1);
  var material = new THREE.MeshBasicMaterial({
    map: map,
    color: 0xffffff,
    // wireframe: true,
    transparent: true
  });
  var mesh = new THREE.Mesh(plane, material);
  mesh.position.set(lngs[0] + (lngs[1] - lngs[0]) / 2, lats[0] + (lats[1] - lats[0]) / 2, z);
  mesh.rotateZ(Math.PI * 0.1);
  return mesh;
};

Geometry.prototype.buildEdges = function (geometry, color) {
  color = color.clone();
  ["r", "g", "b"].map(function (band) {
    color[band] = color[band] * 0.5;
  });
  geometry = new THREE.EdgesGeometry(geometry);
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    color: color.getHex()
  }));
};

Geometry.prototype.buildWireframe = function (geometry, color) {
  var material = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    color: color
  });
  return new THREE.Mesh(geometry, material);
};

export default Geometry;