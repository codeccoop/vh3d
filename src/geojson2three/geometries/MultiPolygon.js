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
        let mesh = new this.Mesh(geometry, material);
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

MultiPolygon.prototype.buildEdges = function (geometry, color) {
  color = color.clone();
  [("r", "g", "b")].map((band) => {
    color[band] = color[band] * 0.75;
  });
  geometry = new THREE.EdgesGeometry(geometry);
  return new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: color.getHex() })
  );
  // return new this.Mesh(geometry, this.WireframeMaterial());
};

export default MultiPolygon;
