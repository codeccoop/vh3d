function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import Geometry from "./Geometry.js";
import BBox from "../components/BBox.js";
import Coordinates from "../components/Coordinates.js";

function Polygon(json, settings) {
  Geometry.call(this, json, settings);
}

Polygon.prototype = Object.create(Geometry.prototype);

Polygon.prototype.build = function () {
  var _iterator = _createForOfIteratorHelper(this.json.features),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var feat = _step.value;
      var zFactor = (this.settings.zFactor || 1) * this.worldScale;
      var base = (feat.properties[this.settings.base] || this.settings.base || 0) * zFactor;
      var height = (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;
      var bbox = null;
      if (this.settings.primitive_type) bbox = new BBox([feat], this.settings.z).get();

      var _iterator2 = _createForOfIteratorHelper(feat.geometry.coordinates),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var segment = _step2.value;
          var geometry = void 0,
              material = void 0,
              mesh = void 0;
          material = this.material;

          if (typeof this.settings.color === "function") {
            material = this.material.clone();
            material.color.set(this.settings.color(feat));
          }

          if (!this.settings.primitive_type) {
            var shape = new this.Shape();
            var init = false;

            var _iterator3 = _createForOfIteratorHelper(segment),
                _step3;

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var coord = _step3.value;

                if (!init) {
                  shape.moveTo.apply(shape, _toConsumableArray(coord));
                  init = true;
                } else {
                  shape.lineTo.apply(shape, _toConsumableArray(coord));
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            geometry = new this.Geometry(shape, _objectSpread({
              depth: height
            }, this.settings));
            mesh = new this.Mesh(geometry, material);
          } else {
            // Case when it's a rectangle
            var lngs = bbox.lngs;
            var lats = bbox.lats;
            var lastCoord = null,
                maxDistance = 0,
                minDistance = Infinity,
                orientation = null;

            var _iterator4 = _createForOfIteratorHelper(segment),
                _step4;

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                var _coord = _step4.value;

                if (!lastCoord) {
                  lastCoord = _coord;
                  continue;
                }

                var distance = Math.abs(Coordinates.getDistance(lastCoord, _coord));
                var azimuth = Math.abs(Coordinates.getAzimuth(lastCoord, _coord));

                if (distance > maxDistance) {
                  orientation = azimuth;
                  maxDistance = distance;
                }

                if (distance < minDistance) {
                  minDistance = distance;
                }

                lastCoord = _coord;
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }

            if (this.settings.primitive_type === "box") {
              geometry = new THREE.BoxGeometry(maxDistance, minDistance, height);
            } else if (this.settings.primitive_type === "plane") {
              geometry = new THREE.PlaneGeometry(maxDistance, minDistance, 1, 1);
            }

            mesh = new this.Mesh(geometry, material);
            mesh.position.set(bbox.center[0], bbox.center[1], base);
            mesh.rotateZ(Math.PI - orientation);
          }

          if (this.settings.edges) {
            var edges = this.buildEdges(geometry, material.color);
            mesh.add(edges);
          }

          this.shapes.push(mesh);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

export default Polygon;