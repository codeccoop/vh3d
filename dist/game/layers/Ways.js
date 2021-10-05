import Layer from "../geojson2three/components/Layer.js";

function Ways(settings) {
  settings = settings || {};
  settings.z = 0.3;
  settings.radius = 5;
  settings.color = 0x7d7d7d; // settings.linewidth = 1;
  // settings.linecap = "butt";
  // settings.linejoin = "butt";

  settings.name = "ways";
  Layer.call(this, settings);
}

Ways.prototype = Object.create(Layer.prototype);

Ways.prototype.load = function () {
  return fetch("/static/data/ways.geojson", {
    method: "GET"
  }).then(res => {
    return res.json().then(this.parse);
  });
};

export default Ways;