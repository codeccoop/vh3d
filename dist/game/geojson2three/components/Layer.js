import MultiPolygon from "../geometries/MultiPolygon.js";
import Polygon from "../geometries/Polygon.js";
import LineString from "../geometries/LineString.js";
import Point from "../geometries/Point.js";
import Emitter from "../../mixins/Emitter.js";
const _settings = {
  data: null,
  color: 0x6cc5ce
};

function Layer(settings) {
  settings = settings || {};
  this.settings = { ..._settings,
    ...settings
  };
  this.data = this.settings.data;
  delete this.settings.data;
  this.name = this.settings.name;
  delete this.settings.name;
  this.settings.side = THREE.DoubleSide;
  Emitter.asEmitter(this);
  this.parse = this.parse.bind(this);

  let _scene, _yScale, _xScale;

  Object.defineProperties(this, {
    scene: {
      get: () => {
        return _scene;
      },
      set: scene => {
        _scene = scene;

        if (this.geometry) {
          this.geometry.scene = scene;
        } else {
          const self = this;

          function onGeomInit(ev) {
            ev.detail.geometry.scene = scene;
            self.$off("geometry:init", onGeomInit);
          }

          this.$on("geometry:init", onGeomInit);
        }
      }
    },
    built: {
      get: () => {
        return this.geometry && this.geometry.built;
      },
      set: () => {
        if (this.geometry) this.geometry.built = false;
      }
    },
    xScale: {
      get: () => {
        return _xScale;
      },
      set: fn => {
        _xScale = fn;
        if (this.geometry) this.geometry.xScale = fn;
        if (this.built) this.build();
      }
    },
    yScale: {
      get: () => {
        return _yScale;
      },
      set: fn => {
        _yScale = fn;
        if (this.geometry) this.geometry.yScale = fn;
        if (this.built) this.build();
      }
    }
  });
}

Layer.prototype.parse = function (data) {
  data = data || this.json;
  this.json = data;
  let geomType;

  if (data.type === "Feature") {
    geomType = data.geometry?.type;
    this.data = [data.properties];
  } else if (data.type === "FeatureCollection") {
    geomType = data.features.length ? data.features[0].geometry?.type : null;
    this.data = data.features.map(d => d.properties);
  } else {
    throw new Error("Unrecognized geojson format");
  }

  switch (geomType) {
    case "MultiPolygon":
      this.geometry = new MultiPolygon(this.json, this.settings);
      break;

    case "Polygon":
      this.geometry = new Polygon(this.json, this.settings);
      break;

    case "LineString":
      this.geometry = new LineString(this.json, this.settings);
      break;

    case "Point":
      this.geometry = new Point(this.json, this.settings);
      break;

    default:
      throw new Error("Unrecognized geometry");
      break;
  }

  if (this.scene) this.geometry.scene = this.scene;
  if (this.xScale) this.geometry.xScale = this.xScale;
  if (this.yScale) this.geometry.yScale = this.yScale;
  this.$emit("geometry:init", {
    geometry: this.geometry,
    layer: this
  });
  return this;
};

Layer.prototype.build = function () {
  if (this.geometry && !this.built) this.geometry.build();
};

Layer.prototype.render = function () {
  if (this.built) this.geometry.render();
};

Layer.prototype.localToWorld = function () {
  const width = this.bbox.get().lngs[1] - this.bbox.get().lngs[0];
  const height = this.bbox.get().lats[1] - this.bbox.get().lngs[1];
  const center = {
    x: this.bbox.get().center[0],
    y: this.bbox.get().center[1]
  };
  const origin = {
    x: center[0] - width / 2,
    y: center[1] - height / 2
  };
  const target = {
    x: origin.x + vector.x,
    y: origin.y + vector.y
  };
  const distance = {
    x: target.x - center[0],
    y: target.y - center[1]
  };
  if (distance.x === 0 && distance.y === 0) return new THREE.Vector2(...center);
  const bearing = Math.atan(distance.y / distance.x);
  const radius = Math.abs(distance.y) > 0 ? distance.y / Math.sin(bearing) : Math.abs(distance.x) > 0 ? distance.x / Math.cos(bearing) : 0;
  return new THREE.Vector2(center[0]);
};

export default Layer;