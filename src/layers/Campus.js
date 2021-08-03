import Layer from "../geojson2three/components/Layer.js";

function Campus(settings) {
  settings = settings || {};
  settings.color = 0xaaaaaa;
  settings.name = "campus";

  Layer.call(this, settings);
}

Campus.prototype = Object.create(Layer.prototype);

Campus.prototype.load = function () {
  return fetch("/data/campus.geojson", {
    method: "GET",
  }).then((res) => {
    return res.json().then(this.parse);
  });
};

export default Campus;
