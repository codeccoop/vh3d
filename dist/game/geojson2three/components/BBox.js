function traverseFeatures(features, callback) {
  var feat, geom, coords, segment, polygon;

  for (var i = 0; i < features.length; i++) {
    feat = features[i];
    geom = features[i].geometry;

    if (geom.type === "Point") {
      callback(feat, geom.coordinates);
    } else if (geom.type === "MultiPoint") {
      for (var j = 0; j < geom.coordinates.length; j++) {
        coords = geom.coordinates[j];
        callback(feat, coords, i);
      }
    } else if (geom.type === "LineString") {
      for (var _j = 0; _j < geom.coordinates.length; _j++) {
        coords = geom.coordinates[_j];
        callback(feat, coords, i);
      }
    } else if (geom.type === "MultiLineString") {
      for (var _j2 = 0; _j2 < geom.coordinates.length; _j2++) {
        segment = geom.coordinates[_j2];

        for (var k = 0; k < segment.length; k++) {
          coords = segment[k];
          callback(feat, coords, i);
        }
      }
    } else if (geom.type === "Polygon") {
      for (var _j3 = 0; _j3 < geom.coordinates.length; _j3++) {
        segment = geom.coordinates[_j3];

        for (var _k = 0; _k < segment.length; _k++) {
          coords = segment[_k];
          callback(feat, coords, i);
        }
      }
    } else if (geom.type === "MultiPolygon") {
      for (var _j4 = 0; _j4 < geom.coordinates.length; _j4++) {
        polygon = geom.coordinates[_j4];

        for (var _k2 = 0; _k2 < polygon.length; _k2++) {
          segment = polygon[_k2];

          for (var l = 0; l < segment.length; l++) {
            coords = segment[l];
            callback(feat, coords, i);
          }
        }
      }
    }
  }
}

function BBox(features, zField, epsgCode) {
  var _this = this;

  this._bbox = {
    SW: [Infinity, Infinity],
    NE: [-Infinity, -Infinity],
    Z: [0, 0],
    edges: {
      x: [null, null],
      y: [null, null]
    }
  };
  traverseFeatures(features, function (feat, coord) {
    _this.updateZ(feat, zField);

    _this.update(coord);
  });
}

BBox.prototype.get = function () {
  var dist = {
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