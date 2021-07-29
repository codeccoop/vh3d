import MultiPolygon from "../geometries/MultiPolygon.js";

const _settings = {
  data: null,
  color: 0x6cc5ce,
};

function Layer(settings) {
  settings = settings || {};
  this.settings = { ..._settings, ...settings };
  this.data = this.settings.data;

  this.parse = this.parse.bind(this);
}

Layer.prototype.parse = function (data) {
  data = data || this.data;
  let geomType;
  if (data.type === "Feature") {
    geomType = data.geometry?.type;
  } else if (data.type === "FeatureCollection") {
    geomType = data.features.length ? data.features[0].geometry?.type : null;
  } else {
    throw new Error("Unrecognized geojson format");
  }

  switch (geomType) {
    case "MultiPolygon":
      this.geometry = new MultiPolygon(data, this.settings);
      if (this._scene) {
        this.geometry._scene = this._scene;
      }
      break;
    default:
      throw new Error("Unregocnized geometry");
      break;
  }

  return this;
};

Layer.prototype.render = function () {
  if (!this.geometry.built) {
    this.geometry.build();
  }
  this.geometry.render();
};

Layer.prototype.center = function (camera) {
  const bbox = this.geometry.bbox.get();
  const x =
    (this.geometry.xScale(bbox.lngs[1]) - this.geometry.xScale(bbox.lngs[0])) /
    2;
  const y =
    (this.geometry.yScale(bbox.lats[1]) - this.geometry.yScale(bbox.lats[0])) /
    2;
  const z = (bbox.z[1] - bbox.z[0]) / 2;

  // camera.lookAt(x, y, z);
  camera.position.set(x, y, z + 2000);
  // camera.updateProjectionMatrix();
};

Layer.prototype.addTo = function (scene) {
  this._scene = scene;
  if (this.geometry) {
    this.geometry._scene = scene;
  }
};

export default Layer;
