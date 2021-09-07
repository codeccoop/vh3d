import Geometry from "./Geometry.js";

function LineString(json, settings) {
  Geometry.call(this, json, settings);
}

LineString.prototype = Object.create(Geometry.prototype);

LineString.prototype.build = function () {
  const zFactor = this.settings.zFactor || 1;
  const radius = this.settings.radius || 1;

  for (let feat of this.json.features) {
    let base = (feat.properties[this.settings.base] || 0) * zFactor;
    let height = (feat.properties[this.settings.z] || this.settings.z) * zFactor - base;
    let p0, p1;
    let boxes = feat.geometry.coordinates.reduce((acum, coord, i, vector) => {
      p0 = coord;
      p1 = vector[i + 1];

      if (p1) {
        acum.push([getSection(p0, p1, radius, 0), // origin edge
        getSection(p0, p1, radius, 1), // next edge
        Math.abs(getDistance(p0, p1)), // distance
        [p0[0] + (p1[0] - p0[0]) / 2, p1[0] + (p1[1] - p0[1]) / 2, base], // position
        getRadian(p0, p1) // rotation
        ]);
      }

      return acum;
    }, []).map(box => {
      let shape = new THREE.Shape();
      shape.moveTo(box[0][0]);
      shape.lineTo(box[0][1]);
      shape.lineTo(box[1][1]);
      shape.lineTo(box[1][0]);
      shape.lineTo(box[0][0]);
      let geom = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        ...this.settings
      });
      let mesh = new THREE.Mesh(geom, this.material);
      this.shapes.push(mesh); // let geom = new THREE.BoxGeometry(radius, box[2], height);
      // geom.position.set(...box[3]);
      // geom.translate(...box[3]);
      // geom.rotateZ = box[4];
      // return geom;
    }); // const geometry = new THREE.BufferGeometry();

    /* let i = 0,
      p1,
      p2,
      rad,
      s1,
      s2,
      d,
      box,
      boxes = [];
    for (let coord of feat.geometry.coordinates) {
      p1 = [this.xScale(coord[0]), this.yScale(coord[1])];
      p2 = feat.geometry.coordinates[i + 1];
      if (!p2) {
        i++;
        continue;
      }
      p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
      rad = getRadian(p1, p2);
      s1 = getSection(p1, p2, radius, 0);
      s2 = getSection(p1, p2, radius, 1);
      d = getDistance(p1, p2);
       box = new THREE.BoxGeometry(radius, Math.abs(d), height);
      // box.translate((p2[0] - p1[0]) / 2, (p2[1] - p1[1]) / 2, base);
      // box.rotateZ = rad;
      box.rotateX = rad;
       let material = this.material;
      let mesh = new this.Mesh(box, material);
      this.shapes.push(mesh);
      // boxes.push(box);
      i++;
    }
    if (!boxes.length) continue;
    const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(boxes); */

    /* let coords = feat.geometry.coordinates.reduce((acum, coord, i, vector) => {
      let p1 = [this.xScale(coord[0]), this.yScale(coord[1])];
      let p2 = vector[i + 1];
      if (p2) {
        p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
        acum[i] = getSection(p1, p2, radius, 0);
      } else {
        p2 = vector[i - 1];
        p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
        acum[i] = getSection(p2, p1, radius, 1);
      }
       p1 = vector[vector.length - (i + 1)];
      p1 = [this.xScale(p1[0]), this.yScale(p1[1])];
      p2 = vector[vector.length - (i + 2)];
      if (p2) {
        acum[vector.length + i] = getSection(p1, p2, radius, 0);
      } else {
        p2 = vector[vector.length - i];
        p2 = [this.xScale(p2[0]), this.yScale(p2[1])];
        acum[vector.length + i] = getSection(p2, p1, radius, 1);
      }
      return acum;
    }, Array.apply(null, Array(feat.geometry.coordinates.length * 2)));
    if (coords.length) coords.push(coords[0]);
     let init;
    let shape = new this.Shape();
    for (let coord of coords) {
      if (init) {
        shape.lineTo(...coord);
      } else {
        shape.moveTo(...coord);
        init = true;
      }
    }
     let geometry = new this.Geometry(shape, {
      depth: height,
      ...this.settings,
    });
     /* let coords = feat.geometry.coordinates.map((coord) => {
      return new THREE.Vector3(
        this.xScale(coord[0]),
        this.yScale(coord[1]),
        height
      );
    });
    let geometry = this.Geometry(coords); */

    /* let material = this.material;
    if (typeof this.settings.color === "function") {
      material = this.material.clone();
      material.color.set(this.settings.color(feat));
    }
     let mesh = new this.Mesh(geometry, material);
    mesh.position.z = base;
    this.shapes.push(mesh); */
  }
};

function getRadian(p1, p2) {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  let tan = dy / dx;
  return tan === 0 ? dx < 0 ? Math.PI : 0 : Math.atan(tan);
}

function getSection(p1, p2, radius, from) {
  let p = from === 1 ? p2 : p1;
  let rad = getRadian(p1, p2) + Math.PI * 0.5;
  return [Math.cos(rad) * radius + p[0], Math.sin(rad) * radius + p[1]];
}

function getDistance(p1, p2) {
  return (p2[0] - p1[0]) / Math.cos(getRadian(p1, p2));
}
/* LineString.prototype.Geometry = function (coords) {
  return new THREE.BufferGeometry().setFromPoints(coords);
};

LineString.prototype.Material = function (settings) {
  console.log(settings);
  return new THREE.LineBasicMaterial(settings);
}; */


export default LineString;