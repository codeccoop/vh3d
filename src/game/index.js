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
    }

    if (ev.code === "KeyH" || ev.code === "KeyM") {
      document.dispatchEvent(
        new CustomEvent("help", {
          detail: this.scene.state.mode,
        })
      );
    } else if (ev.code === "Escape") {
      // && this.scene.state.mode === "orbit") {
      if (this.scene.state.mode === "orbit") {
        this.lock(false);
      } else {
        document.dispatchEvent(new CustomEvent("unlock"));
      }
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
      gltfLoader.load("/static/gltf/arm.gltf", (gltf) => {
        const armRight = gltf.scene;
        armRight.scale.set(1.5, 1.5, 1.5);
        piece.position.fromArray(this.scene.camera.position.toArray());
        piece.position.z = 1;
        piece.rotation.x = Math.PI * 0.5;
        piece.scale.set(0.9, 0.9, 0.6);
        const pieceShadow = piece.clone();
        pieceShadow.scale.set(0.85, 0.85, 0.65);

        piece.children.forEach((child) => {
          if (child.type === "Mesh") {
            child.material = new THREE.MeshLambertMaterial({
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
        armRight.children.forEach((child) => {
          if (child.type === "Mesh") {
            child.material = new THREE.MeshToonMaterial({
              color: "rgb(240, 200, 160)",
            });
          }
        });
        const armLeft = armRight.clone();
        armLeft.scale.x = armLeft.scale.x * -1;
        if (!this.isTouch) {
          this.scene.add(piece);
          this.scene.add(armRight);
          this.scene.add(armLeft);
          this.scene.legoPiece = piece;
          this.scene.legoShadow = pieceShadow;
          this.scene.armRight = armRight;
          this.scene.armLeft = armLeft;
        }

        campus.load().then((campus) => {
          this.scene.bbox = campus.geometry.bbox;
          this.scene.initPosition();
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
      this.distanceToTarget(pieces.getTargetLocation(this.playerData));
    });
  }

  distanceToTarget(target) {
    const direction = this.scene.controls.pointer.getDirection(
      new THREE.Vector3(0, 0, -1)
    );
    const position = this.scene.legoShadow.position;
    const distance = position.distanceTo(target);
    if (distance <= 0.5) {
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
