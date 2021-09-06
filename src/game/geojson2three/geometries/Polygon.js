import Geometry from "./Geometry.js";
import BBox from "../components/BBox.js";
import Coordinates from "../components/Coordinates.js";

function Polygon(json, settings) {
  Geometry.call(this, json, settings);
}

Polygon.prototype = Object.create(Geometry.prototype);

Polygon.prototype.build = function () {
  for (let feat of this.json.features) {
    let zFactor = (this.settings.zFactor || 1) * this.worldScale;
    let base =
      (feat.properties[this.settings.base] || this.settings.base || 0) *
      zFactor;
    let height =
      (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;
    let bbox = null;
    if (this.settings.primitive_type)
      bbox = new BBox([feat], this.settings.z).get();

    for (let segment of feat.geometry.coordinates) {
      let geometry, material, mesh;

      material = this.material;
      if (typeof this.settings.color === "function") {
        material = this.material.clone();
        material.color.set(this.settings.color(feat));
      }

      if (!this.settings.primitive_type) {
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
        geometry = new this.Geometry(shape, {
          depth: height,
          ...this.settings,
        });

        mesh = new this.Mesh(geometry, material);
      } else {
        // Case when it's a rectangle
        const lngs = bbox.lngs;
        const lats = bbox.lats;

        let lastCoord = null,
          maxDistance = 0,
          minDistance = Infinity,
          orientation = null;
        for (let coord of segment) {
          if (!lastCoord) {
            lastCoord = coord;
            continue;
          }

          let distance = Math.abs(Coordinates.getDistance(lastCoord, coord));
          let azimuth = Math.abs(Coordinates.getAzimuth(lastCoord, coord));
          if (distance > maxDistance) {
            orientation = azimuth;
            maxDistance = distance;
          }
          if (distance < minDistance) {
            minDistance = distance;
          }

          lastCoord = coord;
        }

        if (this.settings.primitive_type === "box") {
          geometry = new THREE.BoxGeometry(maxDistance, minDistance, height);
        } else if (this.settings.primitive_type === "plane") {
          geometry = new THREE.PlaneGeometry(maxDistance, minDistance, 1, 1);
        }

        mesh = new this.Mesh(geometry, material);

        mesh.position.set(bbox.center[0], bbox.center[1], base);

        mesh.rotateZ(Math.PI - orientation);
      }

      if (this.settings.edges) {
        let edges = this.buildEdges(geometry, material.color);
        mesh.add(edges);
      }

      this.shapes.push(mesh);
    }
  }
};

export default Polygon;
