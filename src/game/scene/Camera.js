import { PerspectiveCamera } from 'three'

class Camera extends PerspectiveCamera {
  constructor() {
    super(...arguments);
    this.up.set(0, 0, 1);
  }

  centerOn(layer) {
    const bbox = layer.geometry.bbox.get();

    const x =
      (layer.xScale(bbox.center[0] + layer.xScale._range / 2) -
        layer.xScale(bbox.center[0] - layer.xScale._range / 2)) /
      2;
    const y =
      (layer.yScale(bbox.center[1] + layer.yScale._range / 2) -
        layer.yScale(bbox.center[1] - layer.yScale._range / 2)) /
      2;

    const span = Math.max(layer.xScale._range, layer.yScale._range);
    const fov = (this.fov / 360) * Math.PI * 2;
    const z = Math.sin((Math.PI - fov) / 2) / (Math.sin(fov) / span);
    this.position.set(x * 1.4, y * -1.5, z * 0.3);
    this.lookAt(x, y, 0);
    if (this.parentControl && this.parentControl.target) {
      this.parentControl.target.set(x, y, 0);
      this.parentControl.update();
    }
  }
}

export default Camera;
