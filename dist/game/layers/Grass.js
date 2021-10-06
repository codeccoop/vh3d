import Layer from "../geojson2three/components/Layer.js";

function Grass(settings) {
  settings = settings || {};
  settings.color = 0xa3cdb9;
  settings.z = 0.3;
  settings.name = "grass";
  Layer.call(this, settings);
}

Grass.prototype = Object.create(Layer.prototype);

Grass.prototype.load = function () {
  var _this = this;

  return fetch("/static/data/grass.geojson", {
    method: "GET"
  }).then(function (res) {
    return res.json().then(function (data) {
      return _this.parse(data);
    });
  });
};

export default Grass;