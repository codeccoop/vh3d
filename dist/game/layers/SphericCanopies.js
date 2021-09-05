import Layer from "../geojson2three/components/Layer.js";

function ShpericCanopies(settings) {
  settings = settings || {};
  settings.z = 8;
  settings.zFactor = 1;
  settings.radius = 5;
  settings.color = 0x489668;
  settings.name = "spheric_canopies";
  settings.geom_primitive = "sphere";
  Layer.call(this, settings);
}

ShpericCanopies.prototype = Object.create(Layer.prototype);

ShpericCanopies.prototype.load = function () {
  return fetch("/data/trees.sphere.geojson", {
    method: "GET"
  }).then(res => {
    return res.json().then(this.parse);
  });
};

export default ShpericCanopies;