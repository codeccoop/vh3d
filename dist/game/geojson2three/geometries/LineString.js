function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import Geometry from "./Geometry.js";

function LineString(json, settings) {
  Geometry.call(this, json, settings);
}

LineString.prototype = Object.create(Geometry.prototype);

LineString.prototype.build = function () {
  var _this = this;

  var zFactor = this.settings.zFactor || 1;
  var radius = this.settings.radius || 1;

  var _iterator = _createForOfIteratorHelper(this.json.features),
      _step;

  try {
    var _loop = function _loop() {
      var feat = _step.value;
      var base = (feat.properties[_this.settings.base] || 0) * zFactor;
      var height = (feat.properties[_this.settings.z] || _this.settings.z) * zFactor - base;
      var p0 = void 0,
          p1 = void 0;
      var boxes = feat.geometry.coordinates.reduce(function (acum, coord, i, vector) {
        p0 = coord;
        p1 = vector[i + 1];

        if (p1) {
          acum.push([getSection(p0, p1, radius, 0), // origin edge
          getSection(p0, p1, radius, 1), // next edge
          Math.abs(getDistance(p0, p1)), // distance
          [p0[0] + (p1[0] - p0[0]) / 2, p1[0] + (p1[1] - p0[1]) / 2, base], // position
          getRadian(p0, p1) // rotation
          ]);
        }

        return acum;
      }, []).map(function (box) {
        var shape = new THREE.Shape();
        shape.moveTo(box[0][0]);
        shape.lineTo(box[0][1]);
        shape.lineTo(box[1][1]);
        shape.lineTo(box[1][0]);
        shape.lineTo(box[0][0]);
        var geom = new THREE.ExtrudeGeometry(shape, _objectSpread({
          depth: height
        }, _this.settings));
        var mesh = new THREE.Mesh(geom, _this.material);

        _this.shapes.push(mesh); // let geom = new THREE.BoxGeometry(radius, box[2], height);
        // geom.position.set(...box[3]);
        // geom.translate(...box[3]);
        // geom.rotateZ = box[4];
        // return geom;

      }); // const geometry = new THREE.BufferGeometry();

      /* let i = 0,
        p1,
        p2,
        rad,
        s1,
        s2,
        d,
        box,
        boxes = [];
      for (let coord of feat.geometry.coordinates) {
        p1 = [this.xScale(coord[0]), this.yScale(coord[1])];
        p2 = feat.geometry.coordinates[i + 1];
        if (!p2) {
          i++;
          continue;
        }
        p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
        rad = getRadian(p1, p2);
        s1 = getSection(p1, p2, radius, 0);
        s2 = getSection(p1, p2, radius, 1);
        d = getDistance(p1, p2);
         box = new THREE.BoxGeometry(radius, Math.abs(d), height);
        // box.translate((p2[0] - p1[0]) / 2, (p2[1] - p1[1]) / 2, base);
        // box.rotateZ = rad;
        box.rotateX = rad;
         let material = this.material;
        let mesh = new this.Mesh(box, material);
        this.shapes.push(mesh);
        // boxes.push(box);
        i++;
      }
      if (!boxes.length) continue;
      const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(boxes); */

      /* let coords = feat.geometry.coordinates.reduce((acum, coord, i, vector) => {
        let p1 = [this.xScale(coord[0]), this.yScale(coord[1])];
        let p2 = vector[i + 1];
        if (p2) {
          p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
          acum[i] = getSection(p1, p2, radius, 0);
        } else {
          p2 = vector[i - 1];
          p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
          acum[i] = getSection(p2, p1, radius, 1);
        }
         p1 = vector[vector.length - (i + 1)];
        p1 = [this.xScale(p1[0]), this.yScale(p1[1])];
        p2 = vector[vector.length - (i + 2)];
        if (p2) {
          acum[vector.length + i] = getSection(p1, p2, radius, 0);
        } else {
          p2 = vector[vector.length - i];
          p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
          acum[vector.length + i] = getSection(p2, p1, radius, 1);
        }
        return acum;
      }, Array.apply(null, Array(feat.geometry.coordinates.length * 2)));
      if (coords.length) coords.push(coords[0]);
       let init;
      let shape = new this.Shape();
      for (let coord of coords) {
        if (init) {
          shape.lineTo(...coord);
        } else {
          shape.moveTo(...coord);
          init = true;
        }
      }
       let geometry = new this.Geometry(shape, {
        depth: height,
        ...this.settings,
      });
       /* let coords = feat.geometry.coordinates.map((coord) => {
        return new THREE.Vector3(
          this.xScale(coord[0]),
          this.yScale(coord[1]),
          height
        );
      });
      let geometry = this.Geometry(coords); */

      /* let material = this.material;
      if (typeof this.settings.color === "function") {
        material = this.material.clone();
        material.color.set(this.settings.color(feat));
      }
       let mesh = new this.Mesh(geometry, material);
      mesh.position.z = base;
      this.shapes.push(mesh); */
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

function getRadian(p1, p2) {
  var dx = p2[0] - p1[0];
  var dy = p2[1] - p1[1];
  var tan = dy / dx;
  return tan === 0 ? dx < 0 ? Math.PI : 0 : Math.atan(tan);
}

function getSection(p1, p2, radius, from) {
  var p = from === 1 ? p2 : p1;
  var rad = getRadian(p1, p2) + Math.PI * 0.5;
  return [Math.cos(rad) * radius + p[0], Math.sin(rad) * radius + p[1]];
}

function getDistance(p1, p2) {
  return (p2[0] - p1[0]) / Math.cos(getRadian(p1, p2));
}
/* LineString.prototype.Geometry = function (coords) {
  return new THREE.BufferGeometry().setFromPoints(coords);
};

LineString.prototype.Material = function (settings) {
  console.log(settings);
  return new THREE.LineBasicMaterial(settings);
}; */


export default LineString;