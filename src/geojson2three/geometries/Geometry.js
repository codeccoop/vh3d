import * as THREE from "/vendor/threejs/build/three.module.js";

import { BBox } from "../components/BBox.js";
import { ProjectedScale } from "../components/Scales.js";

const _settings = {
  color: 0x6cc5ce,
  z: null,
};

function Geometry(json, settings) {
  this.json = json;
  settings = settings || {};
  this.settings = { ..._settings, ...settings };

  this.bbox = new BBox(json.features, settings.z);
  this.xScale = new ProjectedScale(
    this.bbox.get().lngs,
    settings.xDomain || [0, window.innerWidth]
  );
  this.yScale = new ProjectedScale(
    this.bbox.get().lats,
    settings.yDomain || [0, window.innerHeight]
  );

  this.material = new THREE.MeshLambertMaterial({
    color: settings.color,
  });

  const _build = this.build;
  this.build = () => {
    _build.apply(this, arguments);
    this.built = false;
  };
}

Geometry.prototype.shapes = [];

Geometry.prototype.build = function () {};

Geometry.prototype.render = function (scene) {
  if (!this._scene) {
    throw new Error("Scene must be binded before render");
  }

  for (let shape of this.shapes) {
    this._scene.add(shape);
  }
};

Geometry.prototype.Shape = THREE.Shape;

Geometry.prototype.Geometry = function (shape, settings) {
  if (settings.z != null) {
    return new THREE.ExtrudeGeometry(shape, {
      bevelEnabled: false,
      ...settings,
    });
  } else {
    return new THREE.ShapeGeometry(shape, settings);
  }
};

Geometry.prototype.Mesh = THREE.Mesh;

export default Geometry;
