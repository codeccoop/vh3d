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
  return new Promise((res, rej) => {
    this.loader.load("/puzzle/" + piece_id, (texture) => {
      texture.magFilter = THREE.NearestFilter;
      texture.center.set(0.5, 0.5);
      // texture.rotation = Math.PI * 0.5;
      this.settings.map = texture;
      fetch("/static/data/lego.base.geojson", {
        method: "GET",
      })
        .then((res) => res.json().then(this.parse))
        .then((_) => res())
        .catch((err) => rej(err));
    });
  });
};

Pieces.prototype.render = function () {
  Layer.prototype.render.call(this);
};

Pieces.prototype.localToWorld = function (vector) {
  const mesh = this.geometry.shapes[0];
  mesh.updateWorldMatrix();
  const geom = mesh.geometry;
  const width = geom.parameters.width;
  const height = geom.parameters.height;
  const center = {
    x: mesh.position.x,
    y: mesh.position.y,
  };
  const origin = {
    x: center.x - width / 2,
    y: center.y + height / 2,
  };
  const target = {
    x: origin.x + vector.x,
    y: origin.y - vector.y,
  };
  const distance = {
    x: target.x - center.x,
    y: target.y - center.y,
  };
  if (distance.x === 0 && distance.y === 0) {
    return new THREE.Vector3(center.x, center.y, 0.5);
  }

  const bearing = Math.atan(distance.y / distance.x);
  const radius =
    distance.y !== 0
      ? distance.y / Math.sin(bearing)
      : distance.x !== 0
      ? distance.x / Math.cos(bearing)
      : 0;

  return new THREE.Vector3(
    center.x + Math.cos(bearing + mesh.rotation.z) * radius,
    center.y + Math.sin(bearing + mesh.rotation.z) * radius,
    0.5
  );
};

Pieces.prototype.getTargetLocation = function (playerData) {
  if (!this.built) return;
  const xRel = this.geometry.shapes[0].geometry.parameters.width / 120;
  const yRel = this.geometry.shapes[0].geometry.parameters.height / 75;
  const x = (playerData.col + 1) * xRel - xRel * 0.5;
  const y = (playerData.row + 1) * yRel - yRel * 0.5;
  return this.localToWorld({ x: x, y: y });
};

Pieces.prototype.getNearest = function (vector, direction) {
  const mesh = this.geometry.shapes[0];
  const width = mesh.geometry.parameters.width;
  const height = mesh.geometry.parameters.height;
  const rotation = mesh.rotation.reorder("ZYX");
  let forward =
    Math.round((direction.z - rotation.z) * (360 / (2 * Math.PI))) % 360;
  if (forward < 0) forward = 360 + forward;
  forward =
    forward > 360 * 0.125 && forward <= 360 * 0.375
      ? 1
      : forward > 360 * 0.375 && forward <= 360 * 0.625
      ? 2
      : forward > 360 * 0.625 && forward <= 360 * 0.875
      ? 3
      : 4;

  const rel = {
    x: width / 120,
    y: height / 75,
  };

  const origin = this.localToWorld({ x: 0, y: 0 });
  const lOrigin = {
    x: mesh.position.x - width / 2,
    y: mesh.position.y + height / 2,
  };

  const delta = {
    x: vector.x - origin.x,
    y: origin.y - vector.y,
  };

  const bearing = Math.atan(delta.x / delta.y);
  const radius = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2));

  const local = {
    x: lOrigin.x - Math.sin(bearing - rotation.z) * radius,
    y: lOrigin.y + Math.cos(bearing - rotation.z) * radius,
  };

  const lDelta = {
    x: local.x - lOrigin.x,
    y: lOrigin.y - local.y,
  };

  const lPosition = {
    x: Math.min(
      lOrigin.x + rel.x * 120 - rel.x * 0.5,
      Math.max(
        lOrigin.x + rel.x * 0.5,
        lOrigin.x +
          rel.x * Math.round(lDelta.x / rel.x) +
          rel.x * 0.5 * (forward == 1 ? -1 : +1)
      )
    ),
    y: Math.min(
      lOrigin.y - rel.y * 0.5,
      Math.max(
        lOrigin.y - rel.y * 75 + rel.y * 0.5,
        lOrigin.y -
          rel.y * Math.round(lDelta.y / rel.y) +
          rel.y * 0.5 * (forward == 2 ? -1 : +1)
      )
    ),
  };

  const lRadius = Math.sqrt(
    Math.pow(lPosition.x - lOrigin.x, 2) + Math.pow(lOrigin.y - lPosition.y, 2)
  );
  const lBearing =
    Math.PI * 1.5 +
    Math.atan((lPosition.x - lOrigin.x) / (lOrigin.y - lPosition.y));

  const position = {
    x: origin.x + Math.cos(lBearing + rotation.z) * lRadius,
    y: origin.y + Math.sin(lBearing + rotation.z) * lRadius,
  };

  return new THREE.Vector3(position.x, position.y, vector.z);
};

export default Pieces;
