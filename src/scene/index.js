import Camera from "./Camera.js";
import Controls from "./Controls.js";
import Emitter from "../mixins/Emitter.js";
import { RelativeScale } from "../geojson2three/components/Scales.js";

class Scene extends THREE.Scene {
  constructor() {
    super(...arguments);

    Emitter.asEmitter(this);

    this.background = null;

    this.camera = new Camera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      4000
    );
    // const helper = new THREE.CameraHelper(this.camera);
    // this.add(helper);

    this.lights = new THREE.Group();
    const ambientLight = new THREE.AmbientLight(0x999999, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1000, 0, 2000);
    this.lights.add(ambientLight);
    this.lights.add(directionalLight);
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

  addControls(canvas) {
    this.controls = new Controls(this.camera, canvas);
    this.controls.addEventListener("change", (ev) => {
      this.$emit("controls:change", {
        controls: this.controls,
        scene: this,
      });
    });
    this.camera.parentControls = this.controls;
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
