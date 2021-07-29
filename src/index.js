import * as THREE from "../vendor/threejs/build/three.module.js";

import Controls from "./components/Controls.js";

import Campus from "./components/Campus.js";
import Buildings from "./components/Buildings.js";
import Grass from "./components/Grass.js";

const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: canvas,
  pixelRatio: window.devicePixelRatio,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0, 0);

const scene = new THREE.Scene();
scene.background = null;
// scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.up.set(0, 0, 1);

const lights = new THREE.Group();
const ambient = new THREE.AmbientLight(0x999999, 0.8);
lights.add(ambient);
const direction = new THREE.DirectionalLight(0xffffff, 0.7);
direction.position.set(0, 0, 2000);
lights.add(direction);
scene.add(lights);

function render(time) {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.height !== height || canvas.width !== width) {
    renderer.setSize(width, height, false);
    return true;
  }
}

const root = new THREE.Object3D();
scene.add(root);

const campus = new Campus();
campus.load().then((_) => {
  campus.render();
  campus.center(camera);

  let controls = new Controls(camera, canvas);
  controls.addEventListener("change", render);

  // controls.reset();

  Promise.all([buildings.load(), grass.load()]).then((layers) => {
    for (let layer of layers) {
      layer.geometry.xScale = campus.geometry.xScale;
      layer.geometry.yScale = campus.geometry.yScale;
      layer.render();
    }
    render();
  });
});

const buildings = new Buildings();
const grass = new Grass();

campus.addTo(root);
buildings.addTo(root);
grass.addTo(root);
