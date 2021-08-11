import Scene from "./scene/index.js";

import Campus from "./layers/Campus.js";
import Buildings from "./layers/Buildings.js";
import Grass from "./layers/Grass.js";
import Paths from "./layers/Paths.js";
import SphericTrees from "./layers/SphericTrees.js";
import SphericCanopies from "./layers/SphericCanopies.js";
import TallTrees from "./layers/TallTrees.js";
import TallCanopies from "./layers/TallCanopies.js";
import Lego from "./layers/Lego.js";

function throttle(ms, fn, context) {
  let lastTime = Date.now();

  return function () {
    if (Date.now() - lastTime > ms) {
      fn.apply(context, arguments);
      lastTime = Date.now();
    }
  };
}

export default class Game {
  constructor(isTouch) {
    const self = this;
    this.isTouch = isTouch;
    this.canvas = document.getElementById("canvas");
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: this.canvas,
      pixelRatio: window.devicePixelRatio,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0, 0);

    this.scene = new Scene(this.canvas, isTouch);
    if (isTouch) {
      this.scene.state.mode = "orbit";
    } else {
      this.scene.state.mode = "pointer";
    }

    this.paint = throttle(50, this.paint, this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = this.onResize.bind(this);

    this.scene.$on("control:change", this.paint);
    document.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", this.onResize);

    this.initialize();
  }

  unbind() {
    this.scene.$off("control:change", this.paint);
    document.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onResize);
  }

  lock(to) {
    if (to) this.scene.control.activate(this.scene.state);
    else this.scene.control.deactivate();
  }

  paint() {
    if (this.resizeToDisplaySize()) {
      this.scene.camera.aspect =
        this.canvas.clientWidth / this.canvas.clientHeight;
      this.scene.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.scene.camera);
  }

  resizeToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (
      canvas.height !== window.innerHeight ||
      canvas.width !== window.innerWidth
    ) {
      this.renderer.setSize(width, height, false);
      return true;
    }
    return false;
  }

  onResize() {
    this.canvas.style.height = window.innerHeight + "px";
    this.canvas.style.width = window.innerWidth + "px";
    this.paint();
  }

  onKeyDown(ev) {
    if (this.isTouch) return;
    if (ev.code === "KeyM") {
      if (this.scene.state.mode === "orbit") this.scene.state.mode = "pointer";
      else this.scene.state.mode = "orbit";
    }
  }

  initialize() {
    const campus = new Campus();
    const buildings = new Buildings();
    const grass = new Grass();
    const paths = new Paths();
    const sphericTrees = new SphericTrees();
    const sphericCanopies = new SphericCanopies();
    const tallTrees = new TallTrees();
    const tallCanopies = new TallCanopies();
    const lego = new Lego();

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load("/statics/gltf/pieza.gltf", (gltf) => {
      const root = gltf.scene;
      root.position.fromArray(this.scene.camera.position.toArray());
      root.position.z = 1;
      root.rotation.x = Math.PI * 0.5;
      if (!this.isTouch) {
        this.scene.add(root);
        this.scene.legoPiece = root;
      }

      campus.load().then((campus) => {
        this.scene.bbox = campus.geometry.bbox;
        if (this.isTouch) this.scene.camera.centerOn(campus);

        Promise.all([
          buildings.load(),
          grass.load(),
          paths.load(),
          sphericTrees.load(),
          tallTrees.load(),
          lego.load(),
        ]).then((layers) => {
          sphericCanopies.parse(sphericTrees.json);
          tallCanopies.parse(tallTrees.json);
          this.scene.build();
          this.scene.render();
          lego.geometry.shapes[0].rotateZ(-0.12);
          this.paint();
        });
      });
    });

    this.scene.addLayer(campus);
    this.scene.addLayer(buildings);
    this.scene.addLayer(grass);
    this.scene.addLayer(paths);
    this.scene.addLayer(sphericTrees);
    this.scene.addLayer(sphericCanopies);
    this.scene.addLayer(tallTrees);
    this.scene.addLayer(tallCanopies);
    this.scene.addLayer(lego);
  }
}
