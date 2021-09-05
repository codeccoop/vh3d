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
    this.maxDistance = 1000;
    this.minZoom = 10;
    this.maxZoom = 1000;
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
    this.euler = new THREE.Euler(0, 0, 0, "ZYX");
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 5);
    this.state = {
      _moving: false,
      _moveForward: false,
      _moveBackward: false,
      _moveLeft: false,
      _moveRight: false,
      _canJump: true
    };
    Object.defineProperties(this.state, {
      moving: {
        get: () => {
          return this.state._moving;
        },
        set: to => {
          this.state._moving = to;

          if (!to) {
            this.velocity.x = 0;
            this.velocity.y = 0;
          }
        }
      },
      moveForward: {
        get: () => {
          return this.state._moveForward;
        },
        set: val => {
          if (val !== this.state._moveForward) {
            this.state._moveForward = val;
            this.update();
          }
        }
      },
      moveBackward: {
        get: () => {
          return this.state._moveBackward;
        },
        set: val => {
          if (val !== this.state._moveBackward) {
            this.state._moveBackward = val;
            this.update();
          }
        }
      },
      moveLeft: {
        get: () => {
          return this.state._moveLeft;
        },
        set: val => {
          if (val !== this.state._moveLeft) {
            this.state._moveLeft = val;
            this.update();
          }
        }
      },
      moveRight: {
        get: () => {
          return this.state._moveRight;
        },
        set: val => {
          if (val !== this.state._moveRight) {
            this.state._moveRight = val;
            this.update();
          }
        }
      },
      canJump: {
        get: () => {
          return this.getObject().position.z <= (this.state.isOnTatami ? 3 : 2.5);
        },
        set: () => {
          this.getObject().position.z += 0.1;
          this.update();
        }
      }
    });
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.update = this.update.bind(this);
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.lastTime = performance.now();
    this.lastPosition = this.getObject().position;
    this.buildings = [];
    this.trees = [];
    this.floor = [];
  }

  onKeyDown(event) {
    if (!this.enabled) return;
    this.state.moving = true; // this.state.moving || event.code !== "Space";

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

      case "Space":
        if (this.state.canJump) this.velocity.z += 140;
        this.state.canJump = false;
        break;
    }
  }

  onKeyUp(event) {
    if (!this.enabled || event.code === "Space") return;
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

  isFalling() {
    this.raycaster.ray.origin.copy(this.getObject().position);
    this.raycaster.ray.direction.set(0, 0, -1);
    return this.raycaster.intersectObjects(this.floor).length === 0 && this.state.canJump;
  }

  isOnTatami() {
    this.raycaster.ray.origin.copy(this.getObject().position);
    this.raycaster.ray.direction.set(0, 0, -1);
    const intersections = this.raycaster.intersectObject(this.tatami);
    this.dispatchEvent({
      type: "onTatami",
      value: intersections.length > 0
    });
    return intersections.length > 0;
  }

  isColliding() {
    const position = this.getObject().position;
    const point = turf.point([position.x, position.y]);
    const perimetter = {
      type: "Polygon",
      coordinates: [Array.apply(null, Array(10)).map((_, i) => {
        const bearing = Math.PI * i / 10;
        return [position.x + Math.sin(bearing) * 2, position.y + Math.cos(bearing) * 2];
      })]
    };
    return this.buildings.features.filter(feat => {
      return feat.properties.base === 0 && turf.booleanIntersects(feat, perimetter);
    }).length > 0;
  }

  onColliding(delta) {
    const position = this.getObject().position;
    const direction = this.getDirection(new THREE.Vector3(0, 0, -1));
    this.getObject().position.fromArray([position.x - 10 * direction.x, position.y - 10 * direction.y, position.z]);
    this.state.moving = false;
    throw new Exception("Collision");
  }

  update(time) {
    if (!this.enabled) return;
    const delta = Math.min(75e-3, time && this.lastTime ? (time - this.lastTime) / 1e3 : 75e-3);

    if (!this.state.falling) {
      try {
        this.state.falling = this.isFalling();
        this.state.isOnTatami = this.isOnTatami();
        this.direction.y = Number(this.state.moveForward) - Number(this.state.moveBackward);
        this.direction.x = Number(this.state.moveRight) - Number(this.state.moveLeft);
        this.direction.normalize();
        this.velocity.x -= this.velocity.x * 5 * delta;
        this.velocity.y -= this.velocity.y * 5 * delta;
        if (!this.state.canJump) this.velocity.z -= 9.8 * 55 * delta;else this.velocity.z = 0;
        const acceleration = this.state.isOnTatami ? 50 : 200;

        if (this.state.moveForward || this.state.moveBackward) {
          this.velocity.y -= this.direction.y * acceleration * delta;
        }

        if (this.state.moveLeft || this.state.moveRight) {
          this.velocity.x -= this.direction.x * acceleration * delta;
        }

        this.moveRight(-this.velocity.x * delta);
        this.moveForward(-this.velocity.y * delta);
        this.getObject().position.z = Math.max(this.state.isOnTatami ? 3 : 2.5, this.getObject().position.z + this.velocity.z * delta);
        if (!this.state.isOnTatami && this.isColliding()) this.onColliding(delta);
      } catch (e) {
        console.log("on collision");
      }
    } else {
      this.velocity.z -= 9.8 * 50 * delta;
      this.getObject().position.z += this.velocity.z * delta;

      if (this.getObject().position.z < -1e3) {
        this.deactivate();
        document.dispatchEvent(new CustomEvent("gameover"));
      }
    }

    this.lastTime = time;
    this.lastPosition = this.getObject().position;
    this.dispatchEvent({
      type: "change"
    });

    if (this.state.moving || !this.state.canJump || this.state.falling) {
      requestAnimationFrame(this.update);
    }
  }

  activate() {
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
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    this.euler.setFromQuaternion(this.getObject().quaternion, "ZYX");
    this.euler.z -= movementX * 5e-4;
    this.euler.x -= movementY * 5e-4;
    this.euler.x = Math.max(Math.PI * 0.42, Math.min(Math.PI * 0.8, this.euler.x));
    this.getObject().quaternion.setFromEuler(this.euler);
    this.dispatchEvent({
      type: "change"
    });
  }

}