import Layer from "../geojson2three/components/Layer.js";

function SphericTrees(settings) {
  settings = settings || {};
  settings.z = 4;
  settings.zFactor = 1;
  settings.radius = 0.5;
  settings.color = 0x7d7d7d;
  settings.canopiColor = 0x00ff00;
  settings.name = "spheric_trees";

  settings.geom_primitive = "cylinder";

  Layer.call(this, settings);
}

SphericTrees.prototype = Object.create(Layer.prototype);

SphericTrees.prototype.load = function () {
  return fetch("/data/trees.tall.geojson", {
    method: "GET",
  }).then((res) => {
    return res.json().then(this.parse);
  });
};

export default SphericTrees;
