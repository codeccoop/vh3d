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
  var _this = this;

  return new Promise(function (res, rej) {
    _this.loader.load("/static/images/lego.texture--gray.png", function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(120, 75);
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
  return fetch("/static/data/lego.base.geojson", {
    method: "GET"
  }).then(function (res) {
    return res.json().then(_this.parse);
  });
};

Lego.prototype.render = function () {
  Layer.prototype.render.call(this); // this.geometry.shapes[0].rotation.z = 0;
  // this.geometry.shapes[0].rotateZ(Math.PI - 0.3);
};

export default Lego;