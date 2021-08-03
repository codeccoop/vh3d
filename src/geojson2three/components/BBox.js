function BBox(features, z_field, epsgCode) {
  var self = this;
  this._bbox = {
    SW: [Infinity, Infinity],
    NE: [-Infinity, -Infinity],
    Z: [null, null],
  };

  function __init(features, z_field) {
    var geom, coords, segment, polygon;
    for (var i = 0; i < features.length; i++) {
      this.updateZ(features[i].properties, z_field);
      geom = features[i].geometry;
      if (geom.type === "Point") {
        this.update(geom.coordinates);
      } else if (geom.type === "MultiPoint") {
        for (let j = 0; j < geom.coordinates.length; j++) {
          coords = geom.coordinates[j];
          this.update(coords);
        }
      } else if (geom.type === "LineString") {
        for (let j = 0; j < geom.coordinates.length; j++) {
          coords = geom.coordinates[j];
          this.update(coords);
        }
      } else if (geom.type === "MultiLineString") {
        for (let j = 0; j < geom.coordinates.length; j++) {
          segment = geom.coordinates[j];
          for (let k = 0; k < segment.length; k++) {
            coords = segment[k];
            this.update(coords);
          }
        }
      } else if (geom.type === "Polygon") {
        for (let j = 0; j < geom.coordinates.length; j++) {
          segment = geom.coordinates[j];
          for (let k = 0; k < segment.length; k++) {
            coords = segment[k];
            this.update(coords);
          }
        }
      } else if (geom.type === "MultiPolygon") {
        for (let j = 0; j < geom.coordinates.length; j++) {
          polygon = geom.coordinates[j];
          for (let k = 0; k < polygon.length; k++) {
            segment = polygon[k];
            for (let l = 0; l < segment.length; l++) {
              coords = segment[l];
              this.update(coords);
            }
          }
        }
      }
    }
  }

  __init.call(this, features, z_field);
  return this;
}

BBox.prototype.get = function () {
  const dist = {
    sw: this._bbox.SW,
    ne: this._bbox.NE,
    z: this._bbox.Z,
    lngs: [this._bbox.SW[0], this._bbox.NE[0]],
    lats: [this._bbox.SW[1], this._bbox.NE[1]],
  };
  dist.center = [
    (dist.lngs[1] - dist.lngs[0]) / 2,
    (dist.lats[1] - dist.lats[0]) / 2,
  ];
  return dist;
};

BBox.prototype.update = function (coords) {
  this._bbox.SW[0] =
    coords[0] < this._bbox.SW[0] ? coords[0] : this._bbox.SW[0];
  this._bbox.SW[1] =
    coords[1] < this._bbox.SW[1] ? coords[1] : this._bbox.SW[1];
  this._bbox.NE[0] =
    coords[0] > this._bbox.NE[0] ? coords[0] : this._bbox.NE[0];
  this._bbox.NE[1] =
    coords[1] > this._bbox.NE[1] ? coords[1] : this._bbox.NE[1];
  return this;
};

BBox.prototype.updateZ = function (props, z_field) {
  if (!z_field) return;
  this._bbox.Z[0] =
    this._bbox.Z[0] == null
      ? props[z_field]
      : Number(this._bbox.Z[0]) < Number(props[z_field])
      ? Number(this._bbox.Z[0])
      : Number(props[z_field]);
  this._bbox.Z[1] =
    this._bbox.Z[1] == null
      ? props[z_field]
      : Number(this._bbox.Z[1]) > Number(props[z_field])
      ? Number(this._bbox.Z[1])
      : Number(props[z_field]);
};

export { BBox };
