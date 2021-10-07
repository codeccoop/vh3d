import {
  CylinderGeometry,
  SphereGeometry,
  ConeGeometry,
  MeshToonMaterial
} from 'three'
import Geometry from "./Geometry.js";

function Point(json, settings) {
  Geometry.call(this, json, settings);
}

Point.prototype = Object.create(Geometry.prototype);

Point.prototype.build = function () {
  for (let feat of this.json.features) {
    let zFactor = (this.settings.zFactor || 1) * this.worldScale;
    let base =
      (feat.properties[this.settings.base] || this.settings.base || 0) *
      zFactor;
    let height =
      (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;

    let coord = feat.geometry.coordinates;
    let geometry;
    if (this.settings.geom_primitive === "cylinder") {
      geometry = new this.CylinderGeometry(this.settings.radius, height, 8);
    } else if (this.settings.geom_primitive === "cone") {
      geometry = new this.ConeGeometry(this.settings.radius, height, 8);
    } else {
      geometry = new this.SphereGeometry(this.settings.radius, 15, 8);
    }

    let material = this.material;
    if (typeof this.settings.color === "function") {
      material = this.material.clone();
      material.color.set(this.settings.color(feat));
    }

    let mesh = new this.Mesh(geometry, material);
    if (this.settings.geom_primitive === "cylinder") {
      mesh.position.set(...coord, height / 2 + base);
    } else if (this.settings.geom_primitive === "cone") {
      mesh.position.set(...coord, height / 2 + base);
    } else {
      mesh.position.set(...coord, height);
    }
    mesh.rotateX(Math.PI * 0.5);
    this.shapes.push(mesh);
  }
};

Point.prototype.CylinderGeometry = function (radius, height, segments) {
  return new CylinderGeometry(radius, radius, height, segments);
};

Point.prototype.SphereGeometry = function (radius, wSegments, hSegments) {
  return new SphereGeometry(radius, wSegments, hSegments);
};

Point.prototype.ConeGeometry = function (radius, height, segments) {
  return new ConeGeometry(radius, height, segments);
};

Point.prototype.Material = function (settings) {
  return new MeshToonMaterial(settings);
};

export default Point;
