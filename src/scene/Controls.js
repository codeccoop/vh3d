import { OrbitControls } from "/vendor/threejs/examples/jsm/controls/OrbitControls.js";

class Controls extends OrbitControls {
  constructor(camera, canvas) {
    super(camera, canvas);

    this.enableKeys = false;
    this.rotateSpeed = 0.3;
    this.zoomSpeed = 1;
    this.minAzimuthAngle = Math.PI * (1 / 4);
    this.maxPolarAngle = Math.PI * (1 / 2.2);
    this.minDistance = 10;
    this.maxDistance = 2000;
    // this.enablePan = false;

    this.addEventListener("change", (ev) => {
      // console.log(ev.target.object.rotation.y);
    });
  }
}

export default Controls;
