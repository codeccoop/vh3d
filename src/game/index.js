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
import Pieces from "./layers/Pieces.js";

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
  constructor(piece, isTouch) {
    const self = this;
    this.playerData = piece;
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
    this.scene.onResize();
    this.paint();
  }

  onKeyDown(ev) {
    if (this.isTouch) return;
    if (ev.code === "KeyM") {
      if (this.scene.state.mode === "orbit") this.scene.state.mode = "pointer";
      else this.scene.state.mode = "orbit";
    } else if (ev.code === "KeyH") {
      document.dispatchEvent(new CustomEvent("help"));
    } else if (ev.code === "Escape" && this.scene.state.mode === "orbit") {
      this.lock(false);
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
    const pieces = new Pieces();

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load("/static/gltf/piezaLego.gltf", (gltf) => {
      const piece = gltf.scene;
      piece.position.fromArray(this.scene.camera.position.toArray());
      piece.position.z = 1;
      piece.rotation.x = Math.PI * 0.5;
      const pieceShadow = piece.clone();
      pieceShadow.scale.set(0.9, 0.9, 0.9);

      piece.children.forEach((child) => {
        if (child.type === "Mesh") {
          child.material = new THREE.MeshToonMaterial({
            color: `rgb(${this.playerData.red}, ${this.playerData.green}, ${this.playerData.blue})`,
          });
        }
      });
      pieceShadow.children.forEach((child) => {
        if (child.type === "Mesh") {
          child.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.3,
            transparent: true,
          });
        }
      });
      if (!this.isTouch) {
        this.scene.add(piece);
        this.scene.legoPiece = piece;
        this.scene.legoShadow = pieceShadow;
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
          pieces.load(),
        ]).then((layers) => {
          sphericCanopies.parse(sphericTrees.json);
          tallCanopies.parse(tallTrees.json);
          this.scene.build();
          this.scene.render();
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
    this.scene.addLayer(pieces);

    this.scene.controls.pointer.addEventListener("change", (ev) => {
      this.distanceToTarget(pieces.targetOnWorld(this.playerData));
    });
  }

  distanceToTarget(target) {
    const direction = this.scene.controls.pointer.getDirection(
      new THREE.Vector3(0, 0, -1)
    );
    const playerPosition = this.scene.state.position;
    const position = new THREE.Vector3(
      playerPosition[0] + 3.5 * direction.x,
      playerPosition[1] + 3.5 * direction.y,
      1
    );
    const distance = position.distanceTo(target);
    if (distance < 0.6) {
      this.scene.legoShadow.children.forEach((child) => {
        child.material.color.setHex(0x00ff00);
      });
    } else {
      this.scene.legoShadow.children.forEach((child) => {
        child.material.color.setHex(0xffffff);
      });
    }
    document.dispatchEvent(
      new CustomEvent("distance", {
        detail: {
          value: distance,
        },
      })
    );
  }
}
