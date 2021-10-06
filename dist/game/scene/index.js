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

import Camera from "./Camera.js";
import Lights from "./Lights.js";
import { OrbitControls, PointerLockControls } from "./Controls.js";
import Emitter from "../mixins/Emitter.js";
import { RelativeScale } from "../geojson2three/components/Scales.js";
var origin = [238580.0, 5075606.0];
var target = [238007.0, 5075560.0];

var Scene = /*#__PURE__*/function (_THREE$Scene) {
  _inherits(Scene, _THREE$Scene);

  var _super = _createSuper(Scene);

  function Scene(canvas, mode) {
    var _this;

    _classCallCheck(this, Scene);

    _this = _super.apply(this, arguments);
    Emitter.asEmitter(_assertThisInitialized(_this));
    _this.done = false;
    _this.canvasEl = canvas;
    _this.background = null;
    _this.gameMode = mode;
    _this.state = {
      _mode: mode === "touch" || mode === "cover" ? "orbit" : "pointer",
      orbit: {
        position: new THREE.Vector3(0, 0, 100),
        rotation: new THREE.Euler(1.08, 0.57, 0.28, "XYZ")
      },
      pointer: {
        position: new THREE.Vector3(175, 254, 2.5),
        rotation: new THREE.Euler(Math.PI * 0.5, Math.PI * 0.5, 0.0, "XYZ")
      }
    };
    _this.cameras = {
      orbit: new Camera(45, window.innerWidth / window.innerHeight, 1, 4000),
      pointer: new Camera(60, window.innerWidth / window.innerHeight, 0.1, 400)
    };
    _this.controls = {
      orbit: new OrbitControls(_this.cameras.orbit, _this.canvasEl),
      pointer: new PointerLockControls(_this.cameras.pointer, document.body)
    };
    Object.defineProperties(_this.state, {
      mode: {
        get: function get() {
          return _this.state._mode;
        },
        set: function set(to) {
          if (mode === "cover") return;

          if (_this.state._mode !== to) {
            _this.control.deactivate();

            _this.state._mode = to;

            _this.control.activate(_this.state);

            if (_this.state._mode === "pointer") {
              _this.remove(_this.marker);

              _this.remove(_this.targetLabel);

              _this.add(_this.legoPiece);

              _this.add(_this.armRight);

              _this.add(_this.armLeft);
            } else {
              _this.add(_this.marker);

              _this.add(_this.targetLabel);

              _this.remove(_this.legoPiece);

              _this.remove(_this.armRight);

              _this.remove(_this.armLeft);
            }

            _this.control.dispatchEvent({
              type: "init"
            });
          }
        }
      },
      position: {
        get: function get() {
          return _this.state[_this.state.mode].position;
        },
        set: function set(vector) {
          _this.state[_this.state.mode].position = vector;
        }
      },
      rotation: {
        get: function get() {
          return _this.state[_this.state.mode].rotation;
        },
        set: function set(vector) {
          _this.state[_this.state.mode].rotation = vector;
        }
      }
    });
    Object.defineProperty(_assertThisInitialized(_this), "camera", {
      get: function get() {
        return _this.cameras[_this.state.mode];
      }
    });
    Object.defineProperty(_assertThisInitialized(_this), "control", {
      get: function get() {
        return _this.controls[_this.state.mode];
      }
    });

    for (var _i = 0, _arr = ["orbit", "pointer"]; _i < _arr.length; _i++) {
      var _mode = _arr[_i];

      _this.cameras[_mode].position.copy(_this.state[_mode].position);

      _this.cameras[_mode].rotation.copy(_this.state[_mode].rotation);

      _this.cameras[_mode].parentControl = _this.controls[_mode];
    }

    _this.lights = new Lights();

    _this.add(_this.lights);

    var _bbox, _yScale, _xScale;

    Object.defineProperties(_assertThisInitialized(_this), {
      bbox: {
        get: function get() {
          return _bbox.get();
        },
        set: function set(bbox) {
          _bbox = bbox;

          _this.$emit("bbox:update", {
            bbox: bbox.get()
          });
        }
      },
      xScale: {
        get: function get() {
          return _xScale;
        },
        set: function set(fn) {
          _xScale = fn;

          _this.$emit("scale:update", {
            dim: "x",
            fn: fn
          });
        }
      },
      yScale: {
        get: function get() {
          return _yScale;
        },
        set: function set(fn) {
          _yScale = fn;
          this.$emit("scale:update", {
            dim: "y",
            fn: fn
          });
        }
      }
    });
    _this.geojsonLayers = {};

    _this.$on("scale:update", function (ev) {
      var layer;

      for (var layerName in _this.geojsonLayers) {
        layer = _this.geojsonLayers[layerName];

        if (ev.detail.dim === "x") {
          layer.xScale = ev.detail.fn;
        } else if (ev.detail.dim === "y") {
          layer.yScale = ev.detail.fn;
        }

        layer.built = false;
      }
    });

    _this.$on("bbox:update", function (ev) {
      var bbox = ev.detail.bbox;
      var canvas = document.getElementById("canvas");

      if (canvas.clientWidth < canvas.clientHeight) {
        var percent = canvas.clientHeight / canvas.clientWidth - 1;
        var delta = bbox.lats[1] - bbox.lats[0];
        var xRange = bbox.lngs;
        var yRange = [bbox.lats[0] - delta * percent * 0.5, bbox.lats[1] + delta * percent * 0.5];
        _this.xScale = new RelativeScale(xRange, [0, canvas.clientWidth]);
        _this.yScale = new RelativeScale(yRange, [0, canvas.clientHeight]);
      } else {
        var _percent = canvas.clientWidth / canvas.clientHeight - 1;

        var _delta = bbox.lngs[1] - bbox.lngs[0];

        var _xRange = [bbox.lngs[0] - _delta * _percent * 0.5, bbox.lngs[1] + _delta * _percent * 0.5];
        var _yRange = bbox.lats;
        _this.xScale = new RelativeScale(_xRange, [0, canvas.clientWidth]);
        _this.yScale = new RelativeScale(_yRange, [0, canvas.clientHeight]);
      }

      _this.build();

      _this.render();
    });

    return _this;
  }

  _createClass(Scene, [{
    key: "onControlInit",
    value: function onControlInit(ev) {
      var _this2 = this;

      if (this.state.mode === "orbit" && this.geojsonLayers.campus && this.geojsonLayers.campus.built) {
        this.control.object.centerOn(this.geojsonLayers.campus);
      }

      setTimeout(function () {
        return _this2.control.dispatchEvent({
          type: "change"
        });
      }, 100);
    }
  }, {
    key: "onControlChange",
    value: function onControlChange(ev) {
      if (this.done || !this.control.enabled) return;
      this.state.position.copy(this.camera.position);
      this.state.rotation.copy(this.camera.rotation);
      if (this.state.mode === "pointer") this.updatePositions();
      this.$emit("control:change", {
        control: this.control,
        scene: this
      });
    }
  }, {
    key: "updatePositions",
    value: function updatePositions() {
      var position = this.controls.pointer.getObject().position;

      if (this.marker) {
        this.marker.position.copy(position);
        this.marker.position.z += 20;
      }

      if (this.legoPiece) {
        var direction = this.controls.pointer.getDirection(new THREE.Vector3(0, 0, 0));
        var rotation = this.controls.pointer.getObject().rotation.clone();
        var reordered = rotation.reorder("ZYX");
        var pitch = reordered.x;
        var s = this.state.worldScale;
        this.legoPiece.position.set(position.x + 2 * direction.x * s, position.y + 2 * direction.y * s, position.z - 1.5 * s - 2 * Math.cos(pitch) * 0.5);
        this.armRight.position.set(position.x + 1.5 * direction.x * s, position.y + 1.5 * direction.y * s, position.z - 1.2 * s - 2 * Math.cos(pitch) * 0.5);
        this.armRight.position.x += Math.cos(rotation.z) * 0.7 * s;
        this.armRight.position.y += Math.sin(rotation.z) * 0.7 * s;
        this.armLeft.position.set(position.x + 1.5 * direction.x * s, position.y + 1.5 * direction.y * s, position.z - 1.2 * s - 2 * Math.cos(pitch) * 0.5);
        this.armLeft.position.x -= Math.cos(rotation.z) * 0.7 * s;
        this.armLeft.position.y -= Math.sin(rotation.z) * 0.7 * s;
        this.legoPiece.rotation.copy(rotation);
        this.armRight.rotation.set(-rotation.x + Math.PI * 0.8, -rotation.y, rotation.z + Math.PI, "ZYX");
        this.armLeft.rotation.set(-rotation.x + Math.PI * 0.8, -rotation.y, rotation.z + Math.PI, "ZYX");

        if (this.controls.pointer.state.isOnTatami) {
          this.legoPiece.position.z -= 0.25;
          this.armLeft.position.z -= 0.25;
          this.armRight.position.z -= 0.25;
          var shadowPosition = this.piecesLayer.getNearest({
            x: position.x + 9 * direction.x * s,
            y: position.y + 9 * direction.y * s,
            z: 0.25 * s
          }, this.controls.pointer.getObject().rotation.reorder("ZYX"));
          this.legoShadow.position.copy(shadowPosition);
          this.closinesRing.position.copy(shadowPosition);
          this.closinesRing.position.z = 0.55 * s;
          reordered.x = Math.PI * 0.5;
          this.legoShadow.rotation.copy(reordered);
          this.legoShadow.rotation.z = this.piecesLayer.geometry.shapes[0].rotation.z;
        }
      }
    }
  }, {
    key: "addLayer",
    value: function addLayer(layer) {
      if (!layer.name) {
        throw new Error("Layer must be named");
      }

      layer.scene = this;
      layer.xScale = this.xScale;
      layer.yScale = this.yScale;
      this.geojsonLayers[layer.name] = layer;
      if (layer.built) this.render();
    }
  }, {
    key: "build",
    value: function build() {
      for (var layerName in this.geojsonLayers) {
        this.geojsonLayers[layerName].worldScale = this.state.worldScale || 1;
        this.geojsonLayers[layerName].build();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var layer;
      this.controls.trees = [];

      for (var layerName in this.geojsonLayers) {
        layer = this.geojsonLayers[layerName];

        if (layerName === "campus" && layer.built) {
          this.controls.pointer.floor = layer.geometry.shapes;
        } else if (layerName === "buildings" && layer.built) {
          this.controls.pointer.buildings = layer.geometry.json;
        } else if (layerName.toLowerCase().match(/trees/) && layer.built) {
          this.controls.pointer.trees = this.controls.pointer.trees.concat(layer.geometry.shapes);
        } else if (layerName === "pieces" && layer.built) {
          this.piecesLayer = layer;
          this.controls.pointer.tatami = layer.geometry.shapes[0];
        }

        if (layer.built) layer.render();
      }
    }
  }, {
    key: "onResize",
    value: function onResize() {
      this.$emit("bbox:update", {
        bbox: this.bbox
      });
      this.controls.orbit.update();
    }
  }, {
    key: "onUnlock",
    value: function onUnlock() {
      if (this.gameMode === "cover") return; // console.log("unlock", this.state.mode, this.state.manualUnlock);

      this.controls.pointer.deactivate();

      if (this.state.mode === "pointer" && !this.done && !this.state.manualUnlock) {
        document.dispatchEvent(new CustomEvent("unlock"));
      }

      if (this.state.manualUnlock) this.state.manualUnlock = false;
    }
  }, {
    key: "onTatami",
    value: function onTatami(ev) {
      if (ev.value) {
        if (!this.getObjectById(this.legoShadow.id)) {
          this.add(this.legoShadow);
          this.add(this.closinesRing);
        }
      } else {
        if (this.getObjectById(this.legoShadow.id)) {
          this.remove(this.legoShadow);
          this.remove(this.closinesRing);
        }
      }
    }
  }, {
    key: "initPosition",
    value: function initPosition() {
      var _this$controls$pointe;

      var rescaledOrigin = [this.xScale(origin[0]), this.yScale(origin[1])]; // const rescaledOrigin = [this.xScale(target[0]), this.yScale(target[1])];

      var rescaledTarget = [this.xScale(target[0]), this.yScale(target[1])];

      (_this$controls$pointe = this.controls.pointer.getObject().position).set.apply(_this$controls$pointe, rescaledOrigin.concat([2]));

      if (this.exitLabel) {
        var _this$exitLabel$posit, _this$targetLabel$pos;

        (_this$exitLabel$posit = this.exitLabel.position).set.apply(_this$exitLabel$posit, rescaledOrigin.concat([0.5]));

        this.exitLabel.position.x += 15;
        this.exitLabel.position.y -= 0;

        (_this$targetLabel$pos = this.targetLabel.position).set.apply(_this$targetLabel$pos, rescaledTarget.concat([0.5]));

        this.targetLabel.position.x += 35;
        this.targetLabel.position.y -= 5;
      }

      this.updatePositions();
    }
  }, {
    key: "bind",
    value: function bind() {
      this.onUnlock = this.onUnlock.bind(this);
      this.onControlChange = this.onControlChange.bind(this);
      this.onControlInit = this.onControlInit.bind(this);
      this.onTatami = this.onTatami.bind(this);
      this.controls.pointer.addEventListener("unlock", this.onUnlock);
      this.controls.pointer.addEventListener("change", this.onControlChange);
      this.controls.pointer.addEventListener("init", this.onControlInit);
      this.controls.orbit.addEventListener("change", this.onControlChange);
      this.controls.orbit.addEventListener("init", this.onControlInit);
      this.controls.pointer.addEventListener("onTatami", this.onTatami);
    }
  }, {
    key: "unbind",
    value: function unbind() {
      this.controls.pointer.removeEventListener("unlock", this.onUnlock);
      this.controls.pointer.removeEventListener("change", this.onControlChange);
      this.controls.pointer.removeEventListener("init", this.onControlInit);
      this.controls.orbit.removeEventListener("change", this.onControlChange);
      this.controls.orbit.removeEventListener("init", this.onControlInit);
      this.controls.pointer.removeEventListener("onTatami", this.onTatami);
    }
  }]);

  return Scene;
}(THREE.Scene);

export default Scene;