function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

export var OrbitControls = /*#__PURE__*/function (_THREE$OrbitControls) {
  _inherits(OrbitControls, _THREE$OrbitControls);

  var _super = _createSuper(OrbitControls);

  function OrbitControls(camera, canvas) {
    var _this;

    _classCallCheck(this, OrbitControls);

    _this = _super.call(this, camera, canvas);
    _this.enableDamping = true;
    _this.dampingFactor = 0.2;
    _this.enableKeys = false;
    _this.rotateSpeed = 0.3;
    _this.zoomSpeed = 1;
    _this.minAzimuthAngle = Math.PI * (1 / 4);
    _this.maxPolarAngle = Math.PI * (1 / 2.2);
    _this.minDistance = 10;
    _this.maxDistance = 1000;
    _this.minZoom = 10;
    _this.maxZoom = 1000;
    _this.enablePan = true;
    _this.screenSpacePanning = false;
    return _this;
  }

  _createClass(OrbitControls, [{
    key: "activate",
    value: function activate(state) {
      this.enabled = true;
    }
  }, {
    key: "deactivate",
    value: function deactivate() {
      this.enabled = false;
    }
  }]);

  return OrbitControls;
}(THREE.OrbitControls);
export var PointerLockControls = /*#__PURE__*/function (_THREE$PointerLockCon) {
  _inherits(PointerLockControls, _THREE$PointerLockCon);

  var _super2 = _createSuper(PointerLockControls);

  function PointerLockControls(camera, canvas) {
    var _this2;

    _classCallCheck(this, PointerLockControls);

    _this2 = _super2.call(this, camera, canvas);
    _this2.velocity = new THREE.Vector3();
    _this2.direction = new THREE.Vector3();
    _this2.euler = new THREE.Euler(0, 0, 0, "ZYX");
    _this2.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 5);
    _this2.state = {
      _moving: false,
      _moveForward: false,
      _moveBackward: false,
      _moveLeft: false,
      _moveRight: false,
      _canJump: true
    };
    Object.defineProperties(_this2.state, {
      moving: {
        get: function get() {
          return _this2.state._moving;
        },
        set: function set(to) {
          _this2.state._moving = to;

          if (!to) {
            _this2.velocity.x = 0;
            _this2.velocity.y = 0;
          }
        }
      },
      moveForward: {
        get: function get() {
          return _this2.state._moveForward;
        },
        set: function set(val) {
          if (val !== _this2.state._moveForward) {
            _this2.state._moveForward = val;

            _this2.update();
          }
        }
      },
      moveBackward: {
        get: function get() {
          return _this2.state._moveBackward;
        },
        set: function set(val) {
          if (val !== _this2.state._moveBackward) {
            _this2.state._moveBackward = val;

            _this2.update();
          }
        }
      },
      moveLeft: {
        get: function get() {
          return _this2.state._moveLeft;
        },
        set: function set(val) {
          if (val !== _this2.state._moveLeft) {
            _this2.state._moveLeft = val;

            _this2.update();
          }
        }
      },
      moveRight: {
        get: function get() {
          return _this2.state._moveRight;
        },
        set: function set(val) {
          if (val !== _this2.state._moveRight) {
            _this2.state._moveRight = val;

            _this2.update();
          }
        }
      },
      canJump: {
        get: function get() {
          return _this2.getObject().position.z <= (_this2.state.isOnTatami ? 3 : 2.5);
        },
        set: function set() {
          _this2.getObject().position.z += 0.1;

          _this2.update();
        }
      }
    });
    _this2.onKeyDown = _this2.onKeyDown.bind(_assertThisInitialized(_this2));
    _this2.onKeyUp = _this2.onKeyUp.bind(_assertThisInitialized(_this2));
    _this2.onMouseMove = _this2.onMouseMove.bind(_assertThisInitialized(_this2));
    _this2.update = _this2.update.bind(_assertThisInitialized(_this2));
    _this2.lastTime = performance.now();
    _this2.lastPosition = _this2.getObject().position;
    _this2.buildings = [];
    _this2.trees = [];
    _this2.floor = [];
    return _this2;
  }

  _createClass(PointerLockControls, [{
    key: "onKeyDown",
    value: function onKeyDown(event) {
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
  }, {
    key: "onKeyUp",
    value: function onKeyUp(event) {
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
  }, {
    key: "isFalling",
    value: function isFalling() {
      this.raycaster.ray.origin.copy(this.getObject().position);
      this.raycaster.ray.direction.set(0, 0, -1);
      return this.raycaster.intersectObjects(this.floor).length === 0 && this.state.canJump;
    }
  }, {
    key: "isOnTatami",
    value: function isOnTatami() {
      this.raycaster.ray.origin.copy(this.getObject().position);
      this.raycaster.ray.direction.set(0, 0, -1);
      var intersections = this.raycaster.intersectObject(this.tatami);
      this.dispatchEvent({
        type: "onTatami",
        value: intersections.length > 0
      });
      return intersections.length > 0;
    }
  }, {
    key: "isColliding",
    value: function isColliding() {
      var position = this.getObject().position;
      var point = turf.point([position.x, position.y]);
      var perimetter = {
        type: "Polygon",
        coordinates: [Array.apply(null, Array(10)).map(function (_, i) {
          var bearing = Math.PI * i / 10;
          return [position.x + Math.sin(bearing) * 2, position.y + Math.cos(bearing) * 2];
        })]
      };
      return this.buildings.features.filter(function (feat) {
        return feat.properties.base === 0 && turf.booleanIntersects(feat, perimetter);
      }).length > 0;
    }
  }, {
    key: "onColliding",
    value: function onColliding(delta) {
      var position = this.getObject().position;
      var direction = this.getDirection(new THREE.Vector3(0, 0, -1));
      this.getObject().position.fromArray([position.x - 10 * direction.x, position.y - 10 * direction.y, position.z]);
      this.state.moving = false;
      throw new Exception("Collision");
    }
  }, {
    key: "update",
    value: function update(time) {
      if (!this.enabled) return;
      var delta = Math.min(75e-3, time && this.lastTime ? (time - this.lastTime) / 1e3 : 75e-3);

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
          var acceleration = this.state.isOnTatami ? 50 - Math.min(25, 100 / this.distance) : 200;

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
  }, {
    key: "activate",
    value: function activate(state) {
      this.getObject().rotation.copy(state.rotation);
      this.enabled = true;
      document.addEventListener("mousemove", this.onMouseMove, true);
      document.addEventListener("keydown", this.onKeyDown);
      document.addEventListener("keyup", this.onKeyUp);
      document.addEventListener("pointerlockchange", this.onPointerLockChange);
      this.lock();
    }
  }, {
    key: "deactivate",
    value: function deactivate() {
      this.enabled = false;
      document.removeEventListener("mousemove", this.onMouseMove, true);
      document.removeEventListener("keydown", this.onKeyDown);
      document.removeEventListener("keyup", this.onKeyUp);
      document.removeEventListener("pointerlockchange", this.onPointerLockChange);
      this.unlock();
    }
  }, {
    key: "onMouseMove",
    value: function onMouseMove(event) {
      if (!this.enabled || !this.isLocked) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      this.euler.setFromQuaternion(this.getObject().quaternion, "ZYX");
      this.euler.z -= movementX * 5e-4;
      this.euler.x -= movementY * 5e-4;
      this.euler.x = Math.max(Math.PI * 0.42, Math.min(Math.PI * 0.8, this.euler.x));
      this.getObject().quaternion.setFromEuler(this.euler);
      this.dispatchEvent({
        type: "change"
      });
    }
  }]);

  return PointerLockControls;
}(THREE.PointerLockControls);