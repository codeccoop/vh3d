class Controls extends THREE.OrbitControls {
  constructor(camera, canvas) {
    super(camera, canvas);

    this.enableDamping = true;
    this.dampingFactor = .2;
    this.enableKeys = false;
    this.rotateSpeed = 0.3;
    this.zoomSpeed = 1;
    this.minAzimuthAngle = Math.PI * (1 / 4);
    this.maxPolarAngle = Math.PI * (1 / 2.2);
    this.minDistance = 10;
    this.maxDistance = 2000;
    this.minZoom = 10;
    this.maxZoom = 2000;
    this.enablePan = true;
    this.screenSpacePanning = false;

    this.addEventListener("change", (ev) => {
      // console.log(ev.target.object.rotation.y);
    });

  }
}

export default Controls;
