import Camera from "./Camera.js";
import Lights from "./Lights.js";
import { OrbitControls, PointerLockControls } from "./Controls.js";
import Emitter from "../mixins/Emitter.js";
import { RelativeScale } from "../geojson2three/components/Scales.js";

const origin = [238580.55031842450262, 5075605.921119668520987];

// var puzzleRotation;
class Scene extends THREE.Scene {
  constructor(canvas, isTouch) {
    super(...arguments);

    Emitter.asEmitter(this);

    this.canvasEl = canvas;
    this.background = null;
    this.fog = null;

    this.state = {
      _mode: isTouch ? "orbit" : "pointer",
      orbit: {
        position: [0, 0, 100],
        rotation: [
          1.0833975202556443,
          0.5779279158585705,
          0.2818529890514449,
          "XYZ",
        ],
      },
      pointer: {
        // position: [830, 310, 2],
        position: [175, 254, 2],
        rotation: [Math.PI * 0.5, Math.PI * 0.5, 0.0, "XYZ"],
      },
    };

    this.cameras = {
      orbit: new Camera(55, window.innerWidth / window.innerHeight, 1, 4000),
      pointer: new Camera(35, window.innerWidth / window.innerHeight, 0.1, 400),
    };

    this.controls = {
      orbit: new OrbitControls(this.cameras.orbit, this.canvasEl),
      pointer: new PointerLockControls(this.cameras.pointer, document.body),
    };

    Object.defineProperties(this.state, {
      mode: {
        get: () => {
          return this.state._mode;
        },
        set: (mode) => {
          if (this.state._mode !== mode) {
            this.control.deactivate();
            this.state._mode = mode;
            this.control.activate(this.state);
            if (this.state._mode === "pointer") {
              this.fog = new THREE.Fog(0xffffff, 0, 750);
              this.remove(this.marker);
              this.add(this.legoPiece);
              this.add(this.armRight);
              this.add(this.armLeft);
            } else {
              this.fog = undefined;
              this.add(this.marker);
              this.remove(this.legoPiece);
              this.remove(this.armRight);
              this.remove(this.armLeft);
            }
            this.control.dispatchEvent({ type: "init" });
          }
        },
      },
      position: {
        get: () => {
          return this.state[this.state.mode].position;
        },
        set: (vector) => {
          this.state[this.state.mode].position = vector;
        },
      },
      rotation: {
        get: () => {
          return this.state[this.state.mode].rotation;
        },
        set: (vector) => {
          this.state[this.state.mode].rotation = vector;
        },
      },
    });

    Object.defineProperty(this, "camera", {
      get: () => {
        return this.cameras[this.state.mode];
      },
    });

    Object.defineProperty(this, "control", {
      get: () => {
        return this.controls[this.state.mode];
      },
    });

    this.onControlInit = this.onControlInit.bind(this);
    this.onControlChange = this.onControlChange.bind(this);
    for (let mode of ["orbit", "pointer"]) {
      this.cameras[mode].position.set(...this.state[mode].position);
      this.cameras[mode].rotation.set(...this.state[mode].rotation);
      this.cameras[mode].parentControl = this.controls[mode];

      this.controls[mode].addEventListener("change", this.onControlChange);
      this.controls[mode].addEventListener("init", this.onControlInit);
    }

    this.controls.pointer.addEventListener("unlock", () => {
      if (this.state.mode === "pointer") {
        this.control.deactivate();
        document.dispatchEvent(new CustomEvent("unlock"));
      }
    });

    this.controls.pointer.addEventListener("onTatami", (ev) => {
      if (ev.value) {
        if (!this.getObjectById(this.legoShadow.id)) {
          this.add(this.legoShadow);
          this.add(this.closinesRing);
        }
      } else {
        if (this.getObjectById(this.legoShadow.id)) {
          this.remove(this.legoShadow);
          this.remove(this.closinesRing);
        }
      }
    });

    this.lights = new Lights();
    this.add(this.lights);

    let _bbox, _yScale, _xScale;
    Object.defineProperties(this, {
      bbox: {
        get: () => {
          return _bbox.get();
        },
        set: (bbox) => {
          _bbox = bbox;
          this.$emit("bbox:update", { bbox: bbox.get() });
        },
      },
      xScale: {
        get: () => {
          return _xScale;
        },
        set: (fn) => {
          _xScale = fn;
          this.$emit("scale:update", { dim: "x", fn: fn });
        },
      },
      yScale: {
        get: () => {
          return _yScale;
        },
        set(fn) {
          _yScale = fn;
          this.$emit("scale:update", { dim: "y", fn: fn });
        },
      },
    });

    this.geojsonLayers = {};
    this.$on("scale:update", (ev) => {
      let layer;
      for (let layerName in this.geojsonLayers) {
        layer = this.geojsonLayers[layerName];
        if (ev.detail.dim === "x") {
          layer.xScale = ev.detail.fn;
        } else if (ev.detail.dim === "y") {
          layer.yScale = ev.detail.fn;
        }
        layer.built = false;
      }
    });

    this.$on("bbox:update", (ev) => {
      const canvas = document.getElementById("canvas");
      const domain = [
        0,
        canvas.clientWidth < canvas.clientHeight
          ? canvas.clientWidth
          : canvas.clientHeight,
      ];
      this.xScale = new RelativeScale(ev.detail.bbox.lngs, domain);
      this.yScale = new RelativeScale(ev.detail.bbox.lats, domain);

      this.build();
      this.render();
    });
  }

  onControlInit(ev) {
    if (
      this.state.mode === "orbit" &&
      this.geojsonLayers.campus &&
      this.geojsonLayers.campus.built
    ) {
      this.control.object.centerOn(this.geojsonLayers.campus);
    }
    this.control.dispatchEvent({ type: "change" });
  }

  onControlChange(ev) {
    this.state.position = this.camera.position.toArray();
    this.state.rotation = this.camera.rotation.toArray();

    if (this.state.mode === "pointer") {
      this.marker.position.set(
        this.state.position[0],
        this.state.position[1],
        this.state.position[2] + 20
      );
      if (this.legoPiece) {
        const direction = this.control.getDirection(
          new THREE.Vector3(0, 0, -1)
        );
        const rotation = this.control.getObject().rotation.clone();
        const reordered = rotation.reorder("ZYX");
        const pitch = reordered.x;
        this.legoPiece.position.set(
          this.state.position[0] + 3.5 * direction.x,
          this.state.position[1] + 3.5 * direction.y,
          this.state.position[2] - 1.25 - 2 * Math.cos(pitch)
        );
        this.armRight.position.set(
          this.state.position[0] + 3 * direction.x,
          this.state.position[1] + 3 * direction.y,
          this.state.position[2] - 1.25 - 2 * Math.cos(pitch)
        );
        this.armRight.position.x += Math.cos(rotation.z) * 0.7;
        this.armRight.position.y += Math.sin(rotation.z) * 0.7;
        this.armLeft.position.set(
          this.state.position[0] + 3 * direction.x,
          this.state.position[1] + 3 * direction.y,
          this.state.position[2] - 1.25 - 2 * Math.cos(pitch)
        );
        this.armLeft.position.x -= Math.cos(rotation.z) * 0.7;
        this.armLeft.position.y -= Math.sin(rotation.z) * 0.7;
        this.legoPiece.rotation.copy(rotation);
        this.armRight.rotation.set(
          rotation.x - Math.PI * 0.5,
          rotation.y,
          rotation.z + Math.PI,
          "ZYX"
        );
        this.armLeft.rotation.set(
          rotation.x - Math.PI * 0.5,
          rotation.y,
          rotation.z + Math.PI,
          "ZYX"
        );
        if (this.control.state.isOnTatami) {
          const shadowPosition = this.piecesLayer.getNearest(
            {
              x: this.state.position[0] + 8 * direction.x,
              y: this.state.position[1] + 8 * direction.y,
              z: 0.25,
            },
            this.control.getObject().rotation.reorder("ZYX")
          );
          this.legoShadow.position.copy(shadowPosition);
          this.closinesRing.position.copy(shadowPosition);
          this.closinesRing.position.z = 0.55;
          reordered.x = Math.PI * 0.5;
          this.legoShadow.rotation.copy(reordered);
          this.legoShadow.rotation.z =
            this.piecesLayer.geometry.shapes[0].rotation.z;
        }
      }
    }

    this.$emit("control:change", {
      control: this.control,
      scene: this,
    });
  }

  addLayer(layer) {
    if (!layer.name) {
      throw new Error("Layer must be named");
    }
    layer.scene = this;

    layer.xScale = this.xScale;
    layer.yScale = this.yScale;
    this.geojsonLayers[layer.name] = layer;

    if (layer.built) this.render();
  }

  build() {
    for (let layerName in this.geojsonLayers) {
      this.geojsonLayers[layerName].build();
    }
  }

  render() {
    let layer;
    this.controls.trees = [];
    for (let layerName in this.geojsonLayers) {
      layer = this.geojsonLayers[layerName];
      if (layerName === "campus" && layer.built) {
        this.controls.pointer.floor = layer.geometry.shapes;
      } else if (layerName === "buildings" && layer.built) {
        this.controls.pointer.buildings = layer.geometry.json;
      } else if (layerName.toLowerCase().match(/trees/) && layer.built) {
        this.controls.pointer.trees = this.controls.pointer.trees.concat(
          layer.geometry.shapes
        );
      } else if (layerName === "pieces" && layer.built) {
        this.piecesLayer = layer;
        this.controls.pointer.tatami = layer.geometry.shapes[0];
      }
      if (layer.built) layer.render();
    }
  }

  onResize() {
    this.$emit("bbox:update", { bbox: this.bbox });
    this.controls.orbit.update();
  }

  initPosition() {
    const rescaledOrigin = [this.xScale(origin[0]), this.yScale(origin[1])];
    this.controls.pointer.getObject().position.set(...rescaledOrigin, 2);
  }
}

export default Scene;
