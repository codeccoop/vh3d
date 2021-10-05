import Layer from "../geojson2three/components/Layer.js";

function Lego(settings) {
  settings = settings || {};
  settings.color = 0xa7ada9;
  settings.name = "lego";
  settings.z = 0.5;
  settings.base = 0;
  settings.primitive_type = "box";
  Layer.call(this, settings);
  this.loader = new THREE.TextureLoader();
}

Lego.prototype = Object.create(Layer.prototype);

Lego.prototype.load = function () {
  return new Promise((res, rej) => {
    this.loader.load("/static/images/lego.texture--gray.png", texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(120, 75);
      this.settings.map = texture;
      fetch("/static/data/lego.base.geojson", {
        method: "GET"
      }).then(res => res.json().then(this.parse)).then(_ => res()).catch(err => rej(err));
    });
  });
  return fetch("/static/data/lego.base.geojson", {
    method: "GET"
  }).then(res => {
    return res.json().then(this.parse);
  });
};

Lego.prototype.render = function () {
  Layer.prototype.render.call(this); // this.geometry.shapes[0].rotation.z = 0;
  // this.geometry.shapes[0].rotateZ(Math.PI - 0.3);
};

export default Lego;