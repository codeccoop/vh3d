import Layer from "../geojson2three/components/Layer.js";

function TallTrees(settings) {
  settings = settings || {};
  settings.z = 6;
  settings.zFactor = 1;
  settings.radius = 0.5;
  settings.color = 0x7d7d7d;
  settings.name = "tall_trees";

  settings.geom_primitive = "cylinder";

  Layer.call(this, settings);
}

TallTrees.prototype = Object.create(Layer.prototype);

TallTrees.prototype.load = function () {
  return fetch("/static/data/trees.sphere.geojson", {
    method: "GET",
  }).then((res) => {
    return res.json().then(this.parse);
  });
};

export default TallTrees;
