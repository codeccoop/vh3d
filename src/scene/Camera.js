class Camera extends THREE.PerspectiveCamera {
  constructor() {
    super(...arguments);
    this.up.set(0, 0, 1);
  }

  centerOn(layer) {
    const bbox = layer.geometry.bbox.get();

    const x = (layer.xScale(bbox.lngs[1]) - layer.xScale(bbox.lngs[0])) / 2;
    const y = (layer.yScale(bbox.lats[1]) - layer.yScale(bbox.lats[0])) / 2;
    const z = 0;

    this.position.set(x, -1000, 2000);
    this.lookAt(x, y, z);
    if (this.parentControls) {
      this.parentControls.target.set(x, y, z);
      this.parentControls.update();
    }
  }
}

export default Camera;
