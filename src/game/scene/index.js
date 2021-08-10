import Camera from "./Camera.js";
import Lights from "./Lights.js";
import { OrbitControls, PointerLockControls } from "./Controls.js";
import Emitter from "../mixins/Emitter.js";
import { RelativeScale } from "../geojson2three/components/Scales.js";

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
        position: [1279.1460223999, -612.0267163797657, 576.7102234202409],
        rotation: [
          1.0833975202556443,
          0.5779279158585705,
          0.2818529890514449,
          "XYZ",
        ],
      },
      pointer: {
        position: [798.7106505288187, 309.94521294983355, 2.0],
        // rotation: [1.2569447071003694, 1.0917005085438625, 0.0, "XYZ"],
        rotation: [1.5, Math.PI * 0.5, 0.0, "XYZ"],
      },
    };

    const markerGeom = new THREE.ConeGeometry(10, 30, 32);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.marker = new THREE.Mesh(markerGeom, markerMaterial);
    this.marker.rotation.x = -Math.PI * 0.5;

    this.cameras = {
      orbit: new Camera(50, window.innerWidth / window.innerHeight, 1, 4000),
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
            this.control.activate();
            if (this.state._mode === "pointer") {
              this.fog = new THREE.Fog(0xffffff, 0, 750);
              this.remove(this.marker);
              this.add(this.legoPiece);
            } else {
              this.fog = undefined;
              this.add(this.marker);
              this.remove(this.legoPiece);
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
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("unlock"));
        }, 1000);
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
      this.xScale = new RelativeScale(ev.detail.bbox.lngs, [
        0,
        Math.min(window.innerHeight, window.innerWidth),
      ]);
      this.yScale = new RelativeScale(ev.detail.bbox.lats, [
        0,
        Math.min(window.innerHeight, window.innerWidth),
      ]);

      let layer;
      for (let layerName in this.geojsonLayers) {
        layer = this.geojsonLayers[layerName];
        layer.xScale = this.xScale;
        layer.yScale = this.yScale;
      }
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
          new THREE.Vector3(0, -1, 0)
        );
        this.legoPiece.position.set(
          this.state.position[0] + 2 * direction.x,
          this.state.position[1] + 2 * direction.y,
          1
        );
        this.legoPiece.rotation.fromArray(this.state.rotation);
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
    for (let layerName in this.geojsonLayers) {
      layer = this.geojsonLayers[layerName];
      if (layer.built) layer.render();
    }
  }
}

export default Scene;
