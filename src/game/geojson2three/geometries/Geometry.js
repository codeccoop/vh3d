import {
  Shape,
  LineSegments,
  ShapeGeometry,
  ExtrudeGeometry,
  PlaneGeometry,
  EdgesGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  LineBasicMaterial
} from 'three'

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
  const bbox = this.bbox.get();
  const canvas = document.getElementById("canvas");
  if (canvas.clientWidth < canvas.clientHeight) {
    const percent = canvas.clientHeight / canvas.clientWidth - 1;
    const delta = bbox.lats[1] - bbox.lats[0];
    const xRange = bbox.lngs;
    const yRange = [
      bbox.lats[0] - delta * percent * 0.5,
      bbox.lats[1] - delta * percent * 0.5,
    ];
    this.xScale =
      this.xScale || new RelativeScale(xRange, [0, canvas.clientWidth]);
    this.yScale =
      this.yScale || new RelativeScale(yRange, [0, canvas.clientHeight]);
  } else {
    const percent = canvas.clientWidth / canvas.clientHeight - 1;
    const delta = bbox.lngs[1] - bbox.lngs[0];
    const xRange = [
      bbox.lngs[0] - delta * percent * 0.5,
      bbox.lngs[1] + delta * percent * 0.5,
    ];
    const yRange = bbox.lngs;
    this.xScale =
      this.xScale || new RelativeScale(xRange, [0, canvas.clientWidth]);
    this.yScale =
      this.yScale || new RelativeScale(yRange, [0, canvas.clientHeight]);
  }
  this.material = this.Material(settings);

  const _build = this.build;
  this.build = () => {
    this.scale();
    _build.apply(this, arguments);
    this.built = true;
    this.$emit("build", { geometry: this });
  };

  this.shapes = new Array();

  Emitter.asEmitter(this);
}

Geometry.prototype.scale = function () {
  for (let feat of this.json.features) {
    if (feat.properties.rescaled) continue;
    const type = feat.geometry.type;
    if (type === "Point") {
      feat.geometry.coordinates = [
        this.xScale(feat.geometry.coordinates[0]),
        this.yScale(feat.geometry.coordinates[1]),
      ];
    } else if (type === "LineString") {
      feat.geometry.coordinates = feat.geometry.coordinates.map((coord) => {
        return [this.xScale(coord[0]), this.yScale(coord[1])];
      });
    } else if (type === "Polygon") {
      feat.geometry.coordinates.forEach((segment, i) => {
        feat.geometry.coordinates[i] = segment.map((coord) => {
          return [this.xScale(coord[0]), this.yScale(coord[1])];
        });
      });
    } else if (type === "MultiPolygon") {
      feat.geometry.coordinates.forEach((poly, i) => {
        poly.forEach((segment, j) => {
          feat.geometry.coordinates[i][j] = segment.map((coord) => {
            return [this.xScale(coord[0]), this.yScale(coord[1])];
          });
        });
      });
    }
    feat.properties.rescaled = true;
  }
};

Geometry.prototype.build = function () {};

Geometry.prototype.render = function () {
  if (!this.scene) {
    throw new Error("Scene must be binded before render");
  }

  for (let shape of this.shapes) {
    this.scene.add(shape);
  }
};

Geometry.prototype.Shape = Shape;

Geometry.prototype.Geometry = function (shape, settings) {
  if (settings.z != null) {
    return new ExtrudeGeometry(shape, {
      bevelEnabled: false,
      ...settings,
    });
  } else {
    return new ShapeGeometry(shape, settings);
  }
};

Geometry.prototype.Mesh = Mesh;

Geometry.prototype.Material = function (settings) {
  return new MeshToonMaterial(settings);
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

  const plane = new PlaneGeometry(
    lngs[1] - lngs[0],
    lats[1] - lats[0],
    1,
    1
  );
  const material = new MeshBasicMaterial({
    map: map,
    color: 0xffffff,
    // wireframe: true,
    transparent: true,
  });
  const mesh = new Mesh(plane, material);
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
  ["r", "g", "b"].map((band) => {
    color[band] = color[band] * 0.5;
  });
  geometry = new EdgesGeometry(geometry);
  return new LineSegments(
    geometry,
    new LineBasicMaterial({ color: color.getHex() })
  );
};

Geometry.prototype.buildWireframe = function (geometry, color) {
  const material = new MeshBasicMaterial({
    wireframe: true,
    transparent: true,
    color: color,
  });

  return new Mesh(geometry, material);
};

export default Geometry;
