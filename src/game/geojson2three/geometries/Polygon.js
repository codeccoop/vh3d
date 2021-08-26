import Geometry from "./Geometry.js";
import BBox from "../components/BBox.js";
import Coordinates from "../components/Coordinates.js";

function Polygon(json, settings) {
  Geometry.call(this, json, settings);
}

Polygon.prototype = Object.create(Geometry.prototype);

Polygon.prototype.build = function () {
  for (let feat of this.json.features) {
    let zFactor = this.settings.zFactor || 1;
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
        const lngs = bbox.lngs;
        const lats = bbox.lats;

        let lastCoord = null,
          maxDistance = 0,
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
          }
          lastCoord = coord;
        }

        if (this.settings.primitive_type === "box") {
          geometry = new THREE.BoxGeometry(
            lngs[1] - lngs[0],
            lats[1] - lats[0],
            height
          );
        } else if (this.settings.primitive_type === "plane") {
          geometry = new THREE.PlaneGeometry(
            lngs[1] - lngs[0],
            lats[1] - lats[0],
            1,
            1
          );
        }

        mesh = new this.Mesh(geometry, material);

        mesh.position.set(
          lngs[0] + (lngs[1] - lngs[0]) / 2,
          lats[0] + (lats[1] - lats[0]) / 2,
          base
        );

        mesh.rotateZ(orientation);
        // mesh.rotateZ(Math.atan((lats[1] - lats[0]) / (lngs[1] - lngs[0])));
      }

      /* if (material.map) {
        let surface = this.buildUVSurface(
          material.map,
          geometry,
          1,
          1,
          height - base + 0.05
        );
        mesh.add(surface);
      } */

      if (this.settings.edges) {
        let edges = this.buildEdges(geometry, material.color);
        mesh.add(edges);
      }

      // mesh.position.z = base;
      this.shapes.push(mesh);
    }
  }
};

export default Polygon;
