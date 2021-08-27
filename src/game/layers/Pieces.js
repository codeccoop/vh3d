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

Pieces.prototype.load = function () {
  return new Promise((res, rej) => {
    this.loader.load("/puzzle", (texture) => {
      texture.magFilter = THREE.NearestFilter;
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI * 0.5;
      this.settings.map = texture;
      fetch("/data/lego.base.geojson", {
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
  this.geometry.shapes[0].rotateZ(-0.3);
};

Pieces.prototype.targetOnWorld = function (playerData) {
  const x = playerData.col * 0.5;
  const y = playerData.row * 0.5;
  const z = 0.5;
  if (!this.built) return;
  const position = new THREE.Vector3(x, y, z).applyEuler(
    this.geometry.shapes[0].rotation.reorder("ZYX")
  );
  return this.geometry.shapes[0].localToWorld(position);
};

export default Pieces;
