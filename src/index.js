import Scene from "./scene/index.js";

import Campus from "./layers/Campus.js";
import Buildings from "./layers/Buildings.js";
import Grass from "./layers/Grass.js";
import Ways from "./layers/Ways.js";
import SphericTrees from "./layers/SphericTrees.js";
import SphericCanopies from "./layers/SphericCanopies.js";
import TallTrees from "./layers/TallTrees.js";
import TallCanopies from "./layers/TallCanopies.js";

const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: canvas,
  pixelRatio: window.devicePixelRatio,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0, 0);

const scene = new Scene();

renderer.paint = function (time) {
  if (renderer.resizeToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    scene.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    scene.camera.updateProjectionMatrix();
  }

  renderer.render(scene, scene.camera);
};

renderer.resizeToDisplaySize = function (renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (
    canvas.height !== window.innerHeight ||
    canvas.width !== window.innerWidth
  ) {
    renderer.setSize(width, height, false);
    return true;
  }
};

window.addEventListener("resize", function () {
  canvas.style.height = window.innerHeight + "px";
  canvas.style.width = window.innerWidth + "px";
  renderer.paint();
});

const campus = new Campus();
const buildings = new Buildings();
const grass = new Grass();
const ways = new Ways();
const sphericTrees = new SphericTrees();
const sphericCanopies = new SphericCanopies();
const tallTrees = new TallTrees();
const tallCanopies = new TallCanopies();

campus.load().then((campus) => {
  scene.bbox = campus.geometry.bbox;
  scene.camera.centerOn(campus);

  Promise.all([
    buildings.load(),
    grass.load(),
    ways.load(),
    sphericTrees.load(),
    tallTrees.load(),
  ]).then((layers) => {
    sphericCanopies.parse(sphericTrees.json);
    tallCanopies.parse(tallTrees.json);
    scene.build();
    scene.render();
    renderer.paint();
  });
});

scene.addLayer(campus);
scene.addLayer(buildings);
scene.addLayer(grass);
scene.addLayer(ways);
scene.addLayer(sphericTrees);
scene.addLayer(sphericCanopies);
scene.addLayer(tallTrees);
scene.addLayer(tallCanopies);

scene.addControls(canvas);
scene.$on("controls:change", renderer.paint);
