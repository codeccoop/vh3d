function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import Geometry from "./Geometry.js";

function Point(json, settings) {
  Geometry.call(this, json, settings);
}

Point.prototype = Object.create(Geometry.prototype);

Point.prototype.build = function () {
  var _iterator = _createForOfIteratorHelper(this.json.features),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var feat = _step.value;
      var zFactor = (this.settings.zFactor || 1) * this.worldScale;
      var base = (feat.properties[this.settings.base] || this.settings.base || 0) * zFactor;
      var height = (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;
      var coord = feat.geometry.coordinates;
      var geometry = void 0;

      if (this.settings.geom_primitive === "cylinder") {
        geometry = new this.CylinderGeometry(this.settings.radius, height, 8);
      } else if (this.settings.geom_primitive === "cone") {
        geometry = new this.ConeGeometry(this.settings.radius, height, 8);
      } else {
        geometry = new this.SphereGeometry(this.settings.radius, 15, 8);
      }

      var material = this.material;

      if (typeof this.settings.color === "function") {
        material = this.material.clone();
        material.color.set(this.settings.color(feat));
      }

      var mesh = new this.Mesh(geometry, material);

      if (this.settings.geom_primitive === "cylinder") {
        var _mesh$position;

        (_mesh$position = mesh.position).set.apply(_mesh$position, _toConsumableArray(coord).concat([height / 2 + base]));
      } else if (this.settings.geom_primitive === "cone") {
        var _mesh$position2;

        (_mesh$position2 = mesh.position).set.apply(_mesh$position2, _toConsumableArray(coord).concat([height / 2 + base]));
      } else {
        var _mesh$position3;

        (_mesh$position3 = mesh.position).set.apply(_mesh$position3, _toConsumableArray(coord).concat([height]));
      }

      mesh.rotateX(Math.PI * 0.5);
      this.shapes.push(mesh);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

Point.prototype.CylinderGeometry = function (radius, height, segments) {
  return new THREE.CylinderGeometry(radius, radius, height, segments);
};

Point.prototype.SphereGeometry = function (radius, wSegments, hSegments) {
  return new THREE.SphereGeometry(radius, wSegments, hSegments);
};

Point.prototype.ConeGeometry = function (radius, height, segments) {
  return new THREE.ConeGeometry(radius, height, segments);
};

Point.prototype.Material = function (settings) {
  // return new THREE.MeshLambertMaterial(settings);
  return new THREE.MeshToonMaterial(settings);
};

export default Point;