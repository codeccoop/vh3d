import {
  WebGLRenderer,
  ConeGeometry,
  RingGeometry,
  PlaneGeometry,
  TextGeometry,
  ShapeGeometry,
  Shape,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  Mesh,
  DoubleSide,
  FontLoader,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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

import { throttle } from "../helpers.js";

export default class Game {
  constructor(canvas, piece, mode) {
    const self = this;
    this.focus = false;
    this.done = false;
    this.mode = mode;
    this.playerData = piece;
    this.mode = mode;
    this.canvas = canvas;
    this.renderer = new WebGLRenderer({
      alpha: true,
      canvas: this.canvas,
      pixelRatio: window.devicePixelRatio,
      antialias: true,
    });
    this.renderer.setClearColor(0, 0);

    this.scene = new Scene(this.canvas, mode);

    this.paint = throttle(100, this.paint, this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = this.onResize.bind(this);

    this.initialize();
  }

  bind() {
    this.onControlsChange = this.onControlsChange.bind(this);
    this.scene.$on("control:change", this.onControlsChange);
    document.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("resize", this.onResize);
    this.scene.bind();
  }

  unbind() {
    this.scene.$off("control:change", this.onControlsChange);
    document.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("resize", this.onResize);
    this.scene.unbind();
  }

  lock(to) {
    if (to) this.scene.control.activate(this.scene.state);
    else this.scene.control.deactivate();
  }

  paint() {
    if (this.resizeToDisplaySize()) {
      this.scene.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.scene.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.scene.camera);
  }

  resizeToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.height !== height || canvas.width !== width) {
      this.renderer.setSize(width, height, false);
      return true;
    }
    return false;
  }

  onResize() {
    this.scene.onResize();
    this.paint();
  }

  onKeyDown(ev) {
    if (this.scene.control.enabled === false || this.mode === "cover") return;
    if (ev.code === "KeyM") {
      if (this.scene.state.mode === "pointer") {
        this.scene.state.manualUnlock = true;
        // console.log("keydown M", this.scene.state.mode);
        this.scene.state.mode = "orbit";
      } else this.scene.state.mode = "pointer";
      document.dispatchEvent(
        new CustomEvent("help", {
          detail: {
            target: this.scene.state.mode,
          },
        })
      );
    }

    if (ev.code === "KeyH") {
      document.dispatchEvent(
        new CustomEvent("help", {
          detail: {
            target: this.scene.state.mode,
          },
        })
      );
    } else if (ev.code === "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      this.scene.control.deactivate();
      if (this.scene.state.mode === "orbit") {
        document.dispatchEvent(new CustomEvent("unlock"));
      }
    } else if (ev.code === "Enter" || ev.code === "NumpadEnter") {
      if (!this.isOnTarget) return;
      this.scene.state.manualUnlock = true;
      this.done = true;
      this.scene.done = true;
      this.scene.legoShadow.children.forEach(child => {
        child.material = new MeshLambertMaterial({
          color: `rgb(${this.playerData.red}, ${this.playerData.green}, ${this.playerData.blue})`,
        });
      });
      this.scene.remove(this.scene.legoPiece);
      this.scene.legoShadow.position.z = -0.3 * this.scene.state.worldScale;
      this.paint();
      document.dispatchEvent(new CustomEvent("done"));
      this.scene.control.deactivate();
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

    const markerGeom = new ConeGeometry(10, 50, 32);
    const markerMat = new MeshToonMaterial({ color: 0xff0000 });
    const marker = new Mesh(markerGeom, markerMat);
    marker.rotation.x = -Math.PI * 0.5;

    // if (this.mode === "cover") {
    const self = this;
    const loader = new FontLoader();
    loader.load("static/helvetiker_bold.typeface.json", function(font) {
      const textMat = new MeshToonMaterial({ color: 0xffffff });
      const exitGeom = new PlaneGeometry(100, 30);
      const exitText = new TextGeometry("Sortida", {
        size: 14,
        font: font,
        height: 0.5,
        curveSegments: 12,
        bevelEnabled: false,
      });
      const targetGeom = new PlaneGeometry(100, 30);
      const targetText = new TextGeometry("Arribada", {
        size: 13,
        font: font,
        height: 0.5,
        curveSegments: 12,
        bevelEnabled: false,
      });
      const exit = new Mesh(exitGeom, markerMat);
      exit.position.y += 5;
      const exitLabel = new Mesh(exitText, textMat);
      exitLabel.position.x -= 30;
      exitLabel.position.y -= 7;
      exit.add(exitLabel);
      const target = new Mesh(targetGeom, markerMat);
      target.position.y += 5;
      const targetLabel = new Mesh(targetText, textMat);
      targetLabel.position.x -= 35;
      targetLabel.position.y -= 7;
      target.add(targetLabel);

      exit.rotation.z += Math.PI * 0.41;
      target.rotation.z += Math.PI * 0.11;
      self.scene.exitLabel = exit;
      self.scene.targetLabel = target;
      if (self.mode === "cover") {
        self.scene.add(exit);
        self.scene.add(target);
      }
      try {
        if (self.scene.bbox) {
          self.scene.initPosition();
        }
      } catch (err) {}
    });
    // } else {
    this.scene.marker = marker;
    // }

    const closinesGeom = new RingGeometry(
      1.3,
      1.4,
      20,
      1,
      -Math.PI * 0.25,
      Math.PI * 0.5
    );
    const closinesMat = new MeshLambertMaterial({
      transparent: true,
      opacity: 0.8,
      color: 0xfdff85,
      shininess: 150,
    });
    const closinesRing = new Mesh(closinesGeom, closinesMat);
    const arrowShape = new Shape();
    arrowShape.moveTo(-0.5, 0);
    arrowShape.lineTo(0, 1);
    arrowShape.lineTo(0.5, 0);
    arrowShape.bezierCurveTo(0.4, 0.175, -0.4, 0.175, -0.5, 0);
    const arrowGeom = new ShapeGeometry(arrowShape);
    arrowGeom.rotateZ(-Math.PI * 0.48);
    const arrow = new Mesh(arrowGeom, closinesMat);
    arrow.position.x += 1.4;
    closinesRing.add(arrow);
    this.scene.closinesRing = closinesRing;

    this.loadGltfs(() => {
      campus.load().then(campus => {
        this.scene.bbox = campus.geometry.bbox;
        this.scene.initPosition();
        if (this.mode !== "pointer") this.scene.camera.centerOn(campus);
        const canvas = document.getElementById("canvas");

        if (canvas.clientWidth < canvas.clientHeight) {
          this.scene.state.worldScale = Math.min(
            1,
            (campus.yScale(1) - campus.yScale(0)) / 1
          );
        } else {
          this.scene.state.worldScale = Math.min(
            1,
            (campus.xScale(1) - campus.xScale(0)) / 1
          );
        }

        if (this.scene.legoPiece) {
          const args = Array.apply(null, Array(3)).map(d => this.scene.state.worldScale);
          this.scene.legoPiece.scale.set(...args);
          this.scene.legoShadow.scale.set(...args);
        }

        Promise.all([
          buildings.load(),
          grass.load(),
          paths.load(),
          sphericTrees.load(),
          tallTrees.load(),
          lego.load(),
          pieces.load(this.playerData.id),
        ]).then(layers => {
          sphericCanopies.parse(sphericTrees.json);
          tallCanopies.parse(tallTrees.json);
          this.scene.build();
          this.scene.render();
          this.paint();
          this.target = pieces.getTargetLocation(this.playerData);
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
  }

  loadGltfs(callback) {
    if (this.mode === "pointer") {
      const gltfLoader = new GLTFLoader();
      gltfLoader.load("static/gltf/piezaLego.gltf", gltf => {
        const piece = gltf.scene;
        gltfLoader.load("static/gltf/arm.gltf", gltf => {
          const armRight = gltf.scene;
          armRight.rotation.reorder("ZYX");
          armRight.rotation.x = Math.PI * 0.3;
          armRight.scale.set(1.3, 1.3, 1.3);
          piece.position.fromArray(this.scene.camera.position.toArray());
          piece.position.z = 1;
          piece.rotation.x = Math.PI * 0.5;
          const pieceShadow = piece.clone();

          piece.children.forEach(child => {
            if (child.type === "Mesh") {
              child.material = new MeshLambertMaterial({
                color: `rgb(${this.playerData.red}, ${this.playerData.green}, ${this.playerData.blue})`,
              });
            }
          });
          pieceShadow.children.forEach(child => {
            if (child.type === "Mesh") {
              child.material = new MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.3,
                transparent: true,
              });
            }
          });
          armRight.children.forEach(child => {
            if (child.type === "Mesh") {
              child.material = new MeshToonMaterial({
                color: "rgb(240, 200, 160)",
                side: DoubleSide,
              });
            }
          });
          const armLeft = armRight.clone();
          armLeft.scale.x = armLeft.scale.x * -1;
          this.scene.add(piece);
          this.scene.add(armRight);
          this.scene.add(armLeft);
          this.scene.legoPiece = piece;
          this.scene.legoShadow = pieceShadow;
          this.scene.armRight = armRight;
          this.scene.armLeft = armLeft;

          callback.call(this);
        });
      });
    } else {
      // if (this.mode === "cover") this.scene.add(this.scene.marker);
      callback.call(this);
    }
  }

  distanceToTarget(target) {
    this.scene.legoShadow.updateMatrixWorld();
    const position = this.scene.legoShadow.position;
    const distance = position.distanceTo(target);
    return distance;
  }

  onControlsChange(ev) {
    if (
      !this.done &&
      this.scene.state.mode === "pointer" &&
      this.scene.control.state.isOnTatami
    ) {
      const distance = this.distanceToTarget(this.target);
      this.scene.controls.pointer.distance = distance;

      const xDelta = this.scene.closinesRing.position.x - this.target.x;
      const yDelta = this.scene.closinesRing.position.y - this.target.y;

      let targetBearing;
      if (yDelta > 0) {
        targetBearing = Math.atan(xDelta / yDelta);
        if (xDelta < 0) {
          targetBearing = Math.PI * 1.5 - targetBearing;
        } else {
          targetBearing = Math.PI * 1.5 - targetBearing;
        }
      } else {
        targetBearing = Math.atan(yDelta / xDelta);
        if (xDelta > 0) {
          targetBearing += Math.PI;
        }
      }

      this.scene.closinesRing.rotation.z = targetBearing;

      if (distance <= 0.4) {
        this.scene.legoShadow.children.forEach(child => {
          child.material.color.setHex(0x00ff00);
        });
        this.isOnTarget = true;
        this.paint();
      } else {
        this.scene.legoShadow.children.forEach(child => {
          child.material.color.setHex(0xff0000);
        });
        this.paint();
        this.isOnTarget = false;
      }
    } else {
      this.scene.controls.pointer.distance = 1e3;
    }
    this.paint();
  }
}
