export class OrbitControls extends THREE.OrbitControls {
  constructor(camera, canvas) {
    super(camera, canvas);

    this.enableDamping = true;
    this.dampingFactor = 0.2;
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
  }

  activate(state) {
    this.enabled = true;
  }

  deactivate() {
    this.enabled = false;
  }
}

export class PointerLockControls extends THREE.PointerLockControls {
  constructor(camera, canvas) {
    super(camera, canvas);

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.vertex = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );

    this.state = {
      moving: false,
      _moveForward: false,
      _moveBackward: false,
      _moveLeft: false,
      _moveRight: false,
    };

    Object.defineProperties(this.state, {
      moveForward: {
        get: () => {
          return this.state._moveForward;
        },
        set: (val) => {
          if (val !== this.state._moveForward) {
            this.state._moveForward = val;
            this.update();
          }
        },
      },
      moveBackward: {
        get: () => {
          return this.state._moveBackward;
        },
        set: (val) => {
          if (val !== this.state._moveBackward) {
            this.state._moveBackward = val;
            this.update();
          }
        },
      },
      moveLeft: {
        get: () => {
          return this.state._moveLeft;
        },
        set: (val) => {
          if (val !== this.state._moveLeft) {
            this.state._moveLeft = val;
            this.update();
          }
        },
      },
      moveRight: {
        get: () => {
          return this.state._moveRight;
        },
        set: (val) => {
          if (val !== this.state._moveRight) {
            this.state._moveRight = val;
            this.update();
          }
        },
      },
    });

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    // this.onPointerLockChange = this.onPointerLockChange.bind(this);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);

    this.lastTime = performance.now();

    this.objects = [];
  }

  onKeyDown(event) {
    if (!this.enabled) return;
    this.state.moving = true;
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.state.moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.state.moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        this.state.moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        this.state.moveRight = true;
        break;
    }
  }

  onKeyUp(event) {
    if (!this.enabled) return;
    this.state.moving = false;
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.state.moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.state.moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        this.state.moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        this.state.moveRight = false;
        break;
    }
  }

  update() {
    const time = Date.now();
    if (!this.enabled) return;

    this.raycaster.ray.origin.copy(this.getObject().position);

    const intersections = this.raycaster.intersectObjects(this.objects);

    const onObject = intersections.length > 0;

    const delta = 0.05;

    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.y -= this.velocity.y * 10.0 * delta;

    this.direction.y =
      Number(this.state.moveForward) - Number(this.state.moveBackward);
    this.direction.x =
      Number(this.state.moveRight) - Number(this.state.moveLeft);
    this.direction.normalize();

    if (this.state.moveForward || this.state.moveBackward) {
      this.velocity.y -= this.direction.y * 400.0 * delta;
    }
    if (this.state.moveLeft || this.state.moveRight) {
      this.velocity.x -= this.direction.x * 400.0 * delta;
    }

    this.moveRight(-this.velocity.x * delta);
    this.moveForward(-this.velocity.y * delta);

    this.getObject().position.z = 2;

    this.lastTime = time;

    this.dispatchEvent({ type: "change" });

    if (this.state.moving) {
      setTimeout(() => this.update(), 50);
    }
  }

  bindObjects(objects) {
    this.objects = objects;
  }

  activate(state) {
    this.getObject().rotation.fromArray(state.rotation);
    this.enabled = true;
    document.addEventListener("mousemove", this.onMouseMove, true);
    this.lock();
  }

  deactivate() {
    this.enabled = false;
    document.removeEventListener("mousemove", this.onMouseMove, true);
    this.unlock();
  }

  onMouseMove(event) {
    if (!this.enabled || !this.isLocked) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const movementX =
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY =
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    const rotation = this.getObject().rotation;
    rotation.y -= movementX * 0.002;
    this.getObject().rotation.setFromVector3(rotation.toVector3());

    this.dispatchEvent({ type: "change" });
  }
}
