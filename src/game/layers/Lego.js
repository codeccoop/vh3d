import Layer from "../geojson2three/components/Layer.js";

function Lego(settings) {
  settings = settings || {};
  settings.color = 0x008800;
  settings.name = "lego";
  settings.z = 1;
  settings.base = 0.5;
  settings.primitive_type = "box";

  Layer.call(this, settings);

  this.loader = new THREE.TextureLoader();
}

Lego.prototype = Object.create(Layer.prototype);

Lego.prototype.load = function () {
  return new Promise((res, rej) => {
    this.loader.load("/statics/images/lego.texture.png", (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(120, 75);
      // texture.offset.set(0.5, 0.5);
      // texture.center.set(0.25, 0.25);
      // texture.rotation = Math.PI * 0.5;
      this.settings.map = texture;
      fetch("/data/lego.base.geojson", {
        method: "GET",
      })
        .then((res) => res.json().then(this.parse))
        .then((_) => res())
        .catch((err) => rej(err));
    });
  });
  return fetch("/data/lego.base.geojson", {
    method: "GET",
  }).then((res) => {
    return res.json().then(this.parse);
  });
};

export default Lego;
