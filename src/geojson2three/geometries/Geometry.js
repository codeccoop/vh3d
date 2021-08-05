import BBox from "../components/BBox.js";
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
  return new THREE.MeshToonMaterial(settings);
};

Geometry.prototype.buildUVSurface = function (
  map,
  geometry,
  xSegments,
  ySegments,
  z
) {
  xSegments = xSegments || 1;
  ySegments = ySegments || 1;

  const bbox = this.bbox.get();
  const lngs = [this.xScale(bbox.lngs[0]), this.xScale(bbox.lngs[1])];
  const lats = [this.yScale(bbox.lats[0]), this.yScale(bbox.lats[1])];

  const plane = new THREE.PlaneGeometry(
    lngs[1] - lngs[0],
    lats[1] - lats[0],
    1,
    1
  );
  const material = new THREE.MeshBasicMaterial({
    map: map,
    color: 0xffffff,
    // wireframe: true,
    transparent: true,
  });
  const mesh = new THREE.Mesh(plane, material);
  mesh.position.set(
    lngs[0] + (lngs[1] - lngs[0]) / 2,
    lats[0] + (lats[1] - lats[0]) / 2,
    z
  );

  mesh.rotateZ(Math.PI * 0.1);
  return mesh;
};

Geometry.prototype.buildEdges = function (geometry, color) {
  color = color.clone();
  [("r", "g", "b")].map((band) => {
    color[band] = color[band] * 0.75;
  });
  geometry = new THREE.EdgesGeometry(geometry);
  return new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: color.getHex() })
  );
};

Geometry.prototype.buildWireframe = function (geometry, color) {
  const material = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    color: color,
  });

  return new THREE.Mesh(geometry, material);
};

export default Geometry;
