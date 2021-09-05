import Geometry from "./Geometry.js";

function MultiPolygon(json, settings) {
  Geometry.call(this, json, settings);
}

MultiPolygon.prototype = Object.create(Geometry.prototype);

MultiPolygon.prototype.build = function () {
  const zFactor = this.settings.zFactor || 1;

  for (let feat of this.json.features) {
    let base = (feat.properties[this.settings.base] || 0) * zFactor;
    let depth = (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;

    for (let poly of feat.geometry.coordinates) {
      for (let segment of poly) {
        let shape = new this.Shape();
        let init = false;

        for (let coord of segment) {
          if (!init) {
            shape.moveTo(...coord);
            init = true;
          } else {
            shape.lineTo(...coord);
          }
        }

        let geometry = new this.Geometry(shape, {
          depth: depth,
          ...this.settings
        });
        let material = this.material;

        if (typeof this.settings.color === "function") {
          material = this.material.clone();
          material.color.set(this.settings.color(feat));
        }

        let mesh = new this.Mesh(geometry, material);

        if (material.map) {
          let surface = this.buildUVSurface(material.map, geometry, material.map.repeat.x, material.map.repeat.y);
          mesh.add(surface);
        }

        if (this.settings.edges) {
          let edges = this.buildEdges(geometry, material.color);
          mesh.add(edges);
        }

        mesh.position.z = base;
        this.shapes.push(mesh);
      }
    }
  }
};

export default MultiPolygon;