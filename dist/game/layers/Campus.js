import Layer from "../geojson2three/components/Layer.js";

function Campus(settings) {
  settings = settings || {};
  settings.color = 0xaaaaaa;
  settings.name = "campus";
  settings.side = THREE.DoubleSide;
  Layer.call(this, settings);
}

Campus.prototype = Object.create(Layer.prototype);

Campus.prototype.load = function () {
  var _this = this;

  return fetch("/static/data/campus.geojson", {
    method: "GET"
  }).then(function (res) {
    return res.json().then(_this.parse);
  });
};

export default Campus;