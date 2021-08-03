import Geometry from "./Geometry.js";

function MultiPolygon(json, settings) {
  Geometry.call(this, json, settings);
}

MultiPolygon.prototype = Object.create(Geometry.prototype);

MultiPolygon.prototype.build = function () {
  for (let feat of this.json.features) {
    let zFactor = this.settings.zFactor || 1;
    let base = (feat.properties[this.settings.base] || 0) * zFactor;
    let depth =
      (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;
    for (let poly of feat.geometry.coordinates) {
      for (let segment of poly) {
        let shape = new this.Shape();
        let init = false;
        for (let coord of segment) {
          coord = [this.xScale(coord[0]), this.yScale(coord[1])];
          if (!init) {
            shape.moveTo(...coord);
            init = true;
          } else {
            shape.lineTo(...coord);
          }
        }
        let geometry = new this.Geometry(shape, {
          depth: depth,
          ...this.settings,
        });
        let material = this.material;
        if (typeof this.settings.color === "function") {
          material = this.material.clone();
          material.color.set(this.settings.color(feat));
        }
        this.shapes.push(new this.Mesh(geometry, material));
        this.shapes[this.shapes.length - 1].position.z =
          (feat.properties[this.settings.base] || 0) * zFactor;
      }
    }
  }
};

export default MultiPolygon;
