import { BBox } from "../components/BBox.js";
import { RelativeScale } from "../components/Scales.js";

import Emitter from "../../mixins/Emitter.js";

const _settings = {
  color: 0x6cc5ce,
  z: null,
};

function Geometry(json, settings) {
  this.json = json;
  settings = settings || {};
  this.settings = { ..._settings, ...settings };

  this.bbox = new BBox(json.features, settings.z, settings.projection);
  this.xScale =
    this.xScale ||
    new RelativeScale(
      this.bbox.get().lngs,
      settings.xDomain || [0, window.innerWidth]
    );
  this.yScale =
    this.yScale ||
    new RelativeScale(
      this.bbox.get().lats,
      settings.yDomain || [0, window.innerHeight]
    );

  this.material = this.Material(settings);

  const _build = this.build;
  this.build = () => {
    _build.apply(this, arguments);
    this.built = true;
    this.$emit("build", { geometry: this });
  };

  Emitter.asEmitter(this);
}

Geometry.prototype.shapes = [];

Geometry.prototype.build = function () {};

Geometry.prototype.render = function () {
  if (!this.scene) {
    throw new Error("Scene must be binded before render");
  }

  for (let shape of this.shapes) {
    this.scene.add(shape);
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

Geometry.prototype.Material = function (settings) {
  // return new THREE.MeshLambertMaterial(settings);
  return new THREE.MeshToonMaterial(settings);
};

export default Geometry;
