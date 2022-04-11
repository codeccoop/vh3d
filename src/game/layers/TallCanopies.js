import Layer from "../geojson2three/components/Layer.js";

function TallCanopies(settings) {
  settings = settings || {};
  settings.z = 14;
  settings.zFactor = 1;
  settings.radius = 3.5;
  settings.base = 4;
  settings.color = 0x489668;
  settings.name = "tall_canopies";

  settings.geom_primitive = "cone";

  Layer.call(this, settings);
}

TallCanopies.prototype = Object.create(Layer.prototype);

TallCanopies.prototype.load = function() {
  return fetch("static/data/trees.tall.geojson", {
    method: "GET",
  }).then(res => {
    return res.json().then(this.parse);
  });
};

export default TallCanopies;
