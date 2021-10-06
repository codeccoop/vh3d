import Layer from "../geojson2three/components/Layer.js";

function Pieces(settings) {
  settings = settings || {};
  settings.color = 0xa7ada9;
  settings.transparent = true;
  settings.name = "pieces";
  settings.z = 0.5;
  settings.base = 0;
  settings.primitive_type = "box";
  Layer.call(this, settings);
  this.loader = new THREE.TextureLoader();
}

Pieces.prototype = Object.create(Layer.prototype);

Pieces.prototype.load = function (piece_id) {
  var _this = this;

  return new Promise(function (res, rej) {
    _this.loader.load("/puzzle/" + piece_id, function (texture) {
      texture.magFilter = THREE.NearestFilter;
      texture.center.set(0.5, 0.5); // texture.rotation = Math.PI * 0.5;

      _this.settings.map = texture;
      fetch("/static/data/lego.base.geojson", {
        method: "GET"
      }).then(function (res) {
        return res.json().then(_this.parse);
      }).then(function (_) {
        return res();
      }).catch(function (err) {
        return rej(err);
      });
    });
  });
};

Pieces.prototype.render = function () {
  Layer.prototype.render.call(this);
};

Pieces.prototype.localToWorld = function (vector) {
  var mesh = this.geometry.shapes[0];
  mesh.updateWorldMatrix();
  var geom = mesh.geometry;
  var width = geom.parameters.width;
  var height = geom.parameters.height;
  var center = {
    x: mesh.position.x,
    y: mesh.position.y
  };
  var origin = {
    x: center.x - width / 2,
    y: center.y + height / 2
  };
  var target = {
    x: origin.x + vector.x,
    y: origin.y - vector.y
  };
  var distance = {
    x: target.x - center.x,
    y: target.y - center.y
  };

  if (distance.x === 0 && distance.y === 0) {
    return new THREE.Vector3(center.x, center.y, 0.5);
  }

  var bearing = Math.atan(distance.y / distance.x);
  var radius = distance.y !== 0 ? distance.y / Math.sin(bearing) : distance.x !== 0 ? distance.x / Math.cos(bearing) : 0;
  return new THREE.Vector3(center.x + Math.cos(bearing + mesh.rotation.z) * radius, center.y + Math.sin(bearing + mesh.rotation.z) * radius, 0.5);
};

Pieces.prototype.getTargetLocation = function (playerData) {
  if (!this.built) return;
  var xRel = this.geometry.shapes[0].geometry.parameters.width / 120;
  var yRel = this.geometry.shapes[0].geometry.parameters.height / 75;
  var x = (playerData.col + 1) * xRel - xRel * 0.5;
  var y = (playerData.row + 1) * yRel - yRel * 0.5;
  return this.localToWorld({
    x: x,
    y: y
  });
};

Pieces.prototype.getNearest = function (vector, direction) {
  var mesh = this.geometry.shapes[0];
  var width = mesh.geometry.parameters.width;
  var height = mesh.geometry.parameters.height;
  var rotation = mesh.rotation.reorder("ZYX");
  var forward = Math.round((direction.z - rotation.z) * (360 / (2 * Math.PI))) % 360;
  if (forward < 0) forward = 360 + forward;
  forward = forward > 360 * 0.125 && forward <= 360 * 0.375 ? 1 : forward > 360 * 0.375 && forward <= 360 * 0.625 ? 2 : forward > 360 * 0.625 && forward <= 360 * 0.875 ? 3 : 4;
  var rel = {
    x: width / 120,
    y: height / 75
  };
  var origin = this.localToWorld({
    x: 0,
    y: 0
  });
  var lOrigin = {
    x: mesh.position.x - width / 2,
    y: mesh.position.y + height / 2
  };
  var delta = {
    x: vector.x - origin.x,
    y: origin.y - vector.y
  };
  var bearing = Math.atan(delta.x / delta.y);
  var radius = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));
  var local = {
    x: lOrigin.x - Math.sin(bearing - rotation.z) * radius,
    y: lOrigin.y + Math.cos(bearing - rotation.z) * radius
  };
  var lDelta = {
    x: local.x - lOrigin.x,
    y: lOrigin.y - local.y
  };
  var lPosition = {
    x: Math.min(lOrigin.x + rel.x * 120 - rel.x * 0.5, Math.max(lOrigin.x + rel.x * 0.5, lOrigin.x + rel.x * Math.round(lDelta.x / rel.x) + rel.x * 0.5 * (forward == 1 ? -1 : +1))),
    y: Math.min(lOrigin.y - rel.y * 0.5, Math.max(lOrigin.y - rel.y * 75 + rel.y * 0.5, lOrigin.y - rel.y * Math.round(lDelta.y / rel.y) + rel.y * 0.5 * (forward == 2 ? -1 : +1)))
  };
  var lRadius = Math.sqrt(Math.pow(lPosition.x - lOrigin.x, 2) + Math.pow(lOrigin.y - lPosition.y, 2));
  var lBearing = Math.PI * 1.5 + Math.atan((lPosition.x - lOrigin.x) / (lOrigin.y - lPosition.y));
  var position = {
    x: origin.x + Math.cos(lBearing + rotation.z) * lRadius,
    y: origin.y + Math.sin(lBearing + rotation.z) * lRadius
  };
  return new THREE.Vector3(position.x, position.y, vector.z);
};

export default Pieces;