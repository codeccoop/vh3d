import * as THREE from "/vendor/threejs/build/three.module.js";

import { OrbitControls } from "/vendor/threejs/examples/jsm/controls/OrbitControls.js";

class Controls extends OrbitControls {
  constructor(camera, canvas) {
    super(camera, canvas);
    this.enableKeys = false;
    this.panSpeed = 1;
    this.rotateSpeed = 0.5;
    this.zoomSpeed = 1;
    this.keyPanSpeed = 4;
    this.keyRotateSpeed = 4;

    var offset = new THREE.Vector3(),
      spherical = new THREE.Spherical(),
      quat = new THREE.Quaternion().setFromUnitVectors(
        camera.up,
        new THREE.Vector3(0, 1, 0)
      ),
      quatInverse = quat.clone().invert();

    this.cameraRotate = function (thetaDelta, phiDelta) {
      offset.copy(this.target).sub(this.object.position);
      offset.applyQuaternion(quat);

      spherical.setFromVector3(offset);

      spherical.theta += thetaDelta;
      spherical.phi -= phiDelta;

      // restrict theta/phi to be between desired limits
      spherical.theta = Math.max(
        this.minAzimuthAngle,
        Math.min(this.maxAzimuthAngle, spherical.theta)
      );
      spherical.phi = Math.max(
        this.minPolarAngle,
        Math.min(this.maxPolarAngle, spherical.phi)
      );
      spherical.makeSafe();

      offset.setFromSpherical(spherical);
      offset.applyQuaternion(quatInverse);

      this.target.copy(this.object.position).add(offset);
      this.object.lookAt(this.target);
    };
  }
}

export default Controls;
