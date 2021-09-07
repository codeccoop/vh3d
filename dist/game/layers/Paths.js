import Layer from "../geojson2three/components/Layer.js";

function Paths(settings) {
  settings = settings || {};
  settings.z = 0.2;
  settings.color = 0x7d7d7d;
  settings.name = "paths";
  Layer.call(this, settings);
}

Paths.prototype = Object.create(Layer.prototype);

Paths.prototype.load = function () {
  return fetch("/data/paths.geojson", {
    method: "GET"
  }).then(res => {
    return res.json().then(this.parse);
  });
};

export default Paths;