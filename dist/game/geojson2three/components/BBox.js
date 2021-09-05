function traverseFeatures(features, callback) {
  var feat, geom, coords, segment, polygon;

  for (var i = 0; i < features.length; i++) {
    feat = features[i];
    geom = features[i].geometry;

    if (geom.type === "Point") {
      callback(feat, geom.coordinates);
    } else if (geom.type === "MultiPoint") {
      for (let j = 0; j < geom.coordinates.length; j++) {
        coords = geom.coordinates[j];
        callback(feat, coords, i);
      }
    } else if (geom.type === "LineString") {
      for (let j = 0; j < geom.coordinates.length; j++) {
        coords = geom.coordinates[j];
        callback(feat, coords, i);
      }
    } else if (geom.type === "MultiLineString") {
      for (let j = 0; j < geom.coordinates.length; j++) {
        segment = geom.coordinates[j];

        for (let k = 0; k < segment.length; k++) {
          coords = segment[k];
          callback(feat, coords, i);
        }
      }
    } else if (geom.type === "Polygon") {
      for (let j = 0; j < geom.coordinates.length; j++) {
        segment = geom.coordinates[j];

        for (let k = 0; k < segment.length; k++) {
          coords = segment[k];
          callback(feat, coords, i);
        }
      }
    } else if (geom.type === "MultiPolygon") {
      for (let j = 0; j < geom.coordinates.length; j++) {
        polygon = geom.coordinates[j];

        for (let k = 0; k < polygon.length; k++) {
          segment = polygon[k];

          for (let l = 0; l < segment.length; l++) {
            coords = segment[l];
            callback(feat, coords, i);
          }
        }
      }
    }
  }
}

function BBox(features, zField, epsgCode) {
  this._bbox = {
    SW: [Infinity, Infinity],
    NE: [-Infinity, -Infinity],
    Z: [0, 0],
    edges: {
      x: [null, null],
      y: [null, null]
    }
  };
  traverseFeatures(features, (feat, coord) => {
    this.updateZ(feat, zField);
    this.update(coord);
  });
}

BBox.prototype.get = function () {
  const dist = {
    sw: this._bbox.SW,
    ne: this._bbox.NE,
    z: this._bbox.Z,
    lngs: [this._bbox.SW[0], this._bbox.NE[0]],
    lats: [this._bbox.SW[1], this._bbox.NE[1]],
    edges: this._bbox.edges
  };
  dist.center = [dist.lngs[0] + (dist.lngs[1] - dist.lngs[0]) / 2, dist.lats[0] + (dist.lats[1] - dist.lats[0]) / 2];
  return dist;
};

BBox.prototype.update = function (coord) {
  if (coord[0] < this._bbox.SW[0]) {
    this._bbox.SW[0] = coord[0];
    this._bbox.edges.x[0] = coord;
  }

  if (coord[1] < this._bbox.SW[1]) {
    this._bbox.SW[1] = coord[1];
    this._bbox.edges.y[0] = coord;
  }

  if (coord[0] > this._bbox.NE[0]) {
    this._bbox.NE[0] = coord[0];
    this._bbox.edges.x[1] = coord;
  }

  if (coord[1] > this._bbox.NE[1]) {
    this._bbox.NE[1] = coord[1];
    this._bbox.edges.y[1] = coord;
  }
};

BBox.prototype.updateZ = function (feat, zField) {
  if (!zField) return;
  this._bbox.Z[0] = this._bbox.Z[0] == null ? feat.properties[zField] : Number(this._bbox.Z[0]) < Number(feat.properties[zField]) ? Number(this._bbox.Z[0]) : Number(feat.properties[zField]);
  this._bbox.Z[1] = this._bbox.Z[1] == null ? props[zField] : Number(this._bbox.Z[1]) > Number(feat.properties[zField]) ? Number(this._bbox.Z[1]) : Number(feat.properties[zField]);
};

export default BBox;