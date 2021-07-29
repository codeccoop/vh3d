import Layer from "../geojson2three/components/Layer.js";

function Grass(settings) {
  settings = settings || {};
  settings.color = 0xa3cdb9;
  settings.z = 0.1;

  Layer.call(this, settings);
}

Grass.prototype = Object.create(Layer.prototype);

Grass.prototype.load = function () {
  return fetch("/data/grass.geojson", {
    method: "GET",
  }).then((res) => {
    return res.json().then((data) => this.parse(data));
  });
};

export default Grass;
