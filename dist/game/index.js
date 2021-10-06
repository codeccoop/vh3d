function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import Scene from "./scene/index.js";
import Campus from "./layers/Campus.js";
import Buildings from "./layers/Buildings.js";
import Grass from "./layers/Grass.js";
import Paths from "./layers/Paths.js";
import SphericTrees from "./layers/SphericTrees.js";
import SphericCanopies from "./layers/SphericCanopies.js";
import TallTrees from "./layers/TallTrees.js";
import TallCanopies from "./layers/TallCanopies.js";
import Lego from "./layers/Lego.js";
import Pieces from "./layers/Pieces.js";
import { throttle } from "../helpers.js";

var Game = /*#__PURE__*/function () {
  function Game(canvas, piece, mode) {
    _classCallCheck(this, Game);

    var self = this;
    this.focus = false;
    this.done = false;
    this.mode = mode;
    this.playerData = piece;
    this.mode = mode;
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: this.canvas,
      pixelRatio: window.devicePixelRatio,
      antialias: true
    });
    this.renderer.setClearColor(0, 0);
    this.scene = new Scene(this.canvas, mode);
    this.paint = throttle(100, this.paint, this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResize = this.onResize.bind(this);
    this.initialize();
  }

  _createClass(Game, [{
    key: "bind",
    value: function bind() {
      this.onControlsChange = this.onControlsChange.bind(this);
      this.scene.$on("control:change", this.onControlsChange);
      document.addEventListener("keydown", this.onKeyDown, true);
      window.addEventListener("resize", this.onResize);
      this.scene.bind();
    }
  }, {
    key: "unbind",
    value: function unbind() {
      this.scene.$off("control:change", this.onControlsChange);
      document.removeEventListener("keydown", this.onKeyDown, true);
      window.removeEventListener("resize", this.onResize);
      this.scene.unbind();
    }
  }, {
    key: "lock",
    value: function lock(to) {
      if (to) this.scene.control.activate(this.scene.state);else this.scene.control.deactivate();
    }
  }, {
    key: "paint",
    value: function paint() {
      if (this.resizeToDisplaySize()) {
        this.scene.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.scene.camera.updateProjectionMatrix();
      }

      this.renderer.render(this.scene, this.scene.camera);
    }
  }, {
    key: "resizeToDisplaySize",
    value: function resizeToDisplaySize() {
      var canvas = this.renderer.domElement;
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;

      if (canvas.height !== height || canvas.width !== width) {
        this.renderer.setSize(width, height, false);
        return true;
      }

      return false;
    }
  }, {
    key: "onResize",
    value: function onResize() {
      this.scene.onResize();
      this.paint();
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(ev) {
      var _this = this;

      if (this.scene.control.enabled === false || this.mode === "cover") return;

      if (ev.code === "KeyM") {
        if (this.scene.state.mode === "pointer") {
          this.scene.state.manualUnlock = true; // console.log("keydown M", this.scene.state.mode);

          this.scene.state.mode = "orbit";
        } else this.scene.state.mode = "pointer";

        document.dispatchEvent(new CustomEvent("help", {
          detail: {
            target: this.scene.state.mode
          }
        }));
      }

      if (ev.code === "KeyH") {
        document.dispatchEvent(new CustomEvent("help", {
          detail: {
            target: this.scene.state.mode
          }
        }));
      } else if (ev.code === "Escape") {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        this.scene.control.deactivate();

        if (this.scene.state.mode === "orbit") {
          document.dispatchEvent(new CustomEvent("unlock"));
        }
      } else if (ev.code === "Enter" || ev.code === "NumpadEnter") {
        if (!this.isOnTarget) return;
        this.scene.state.manualUnlock = true;
        this.done = true;
        this.scene.done = true;
        this.scene.legoShadow.children.forEach(function (child) {
          child.material = new THREE.MeshLambertMaterial({
            color: "rgb(".concat(_this.playerData.red, ", ").concat(_this.playerData.green, ", ").concat(_this.playerData.blue, ")")
          });
        });
        this.scene.remove(this.scene.legoPiece);
        this.scene.legoShadow.position.z = -0.3 * this.scene.state.worldScale;
        this.paint();
        document.dispatchEvent(new CustomEvent("done"));
        this.scene.control.deactivate();
      }
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this2 = this;

      var campus = new Campus();
      var buildings = new Buildings();
      var grass = new Grass();
      var paths = new Paths();
      var sphericTrees = new SphericTrees();
      var sphericCanopies = new SphericCanopies();
      var tallTrees = new TallTrees();
      var tallCanopies = new TallCanopies();
      var lego = new Lego();
      var pieces = new Pieces();
      var markerGeom = new THREE.ConeGeometry(10, 50, 32);
      var markerMat = new THREE.MeshToonMaterial({
        color: 0xff0000
      });
      var marker = new THREE.Mesh(markerGeom, markerMat);
      marker.rotation.x = -Math.PI * 0.5; // if (this.mode === "cover") {

      var self = this;
      var loader = new THREE.FontLoader();
      loader.load("/vendor/helvetiker_bold.typeface.json", function (font) {
        var textMat = new THREE.MeshToonMaterial({
          color: 0xffffff
        });
        var exitGeom = new THREE.PlaneGeometry(100, 30);
        var exitText = new THREE.TextGeometry("Sortida", {
          size: 14,
          font: font,
          height: 0.5,
          curveSegments: 12,
          bevelEnabled: false
        });
        var targetGeom = new THREE.PlaneGeometry(100, 30);
        var targetText = new THREE.TextGeometry("Arribada", {
          size: 13,
          font: font,
          height: 0.5,
          curveSegments: 12,
          bevelEnabled: false
        });
        var exit = new THREE.Mesh(exitGeom, markerMat);
        exit.position.y += 5;
        var exitLabel = new THREE.Mesh(exitText, textMat);
        exitLabel.position.x -= 30;
        exitLabel.position.y -= 7;
        exit.add(exitLabel);
        var target = new THREE.Mesh(targetGeom, markerMat);
        target.position.y += 5;
        var targetLabel = new THREE.Mesh(targetText, textMat);
        targetLabel.position.x -= 35;
        targetLabel.position.y -= 7;
        target.add(targetLabel);
        exit.rotation.z += Math.PI * 0.41;
        target.rotation.z += Math.PI * 0.11;
        self.scene.exitLabel = exit;
        self.scene.targetLabel = target;

        if (self.mode === "cover") {
          self.scene.add(exit);
          self.scene.add(target);
        }

        try {
          if (self.scene.bbox) {
            self.scene.initPosition();
          }
        } catch (err) {}
      }); // } else {

      this.scene.marker = marker; // }

      var closinesGeom = new THREE.RingGeometry(1.3, 1.4, 20, 1, -Math.PI * 0.25, Math.PI * 0.5);
      var closinesMat = new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 0.8,
        color: 0xfdff85,
        shininess: 150
      });
      var closinesRing = new THREE.Mesh(closinesGeom, closinesMat);
      var arrowShape = new THREE.Shape();
      arrowShape.moveTo(-0.5, 0);
      arrowShape.lineTo(0, 1);
      arrowShape.lineTo(0.5, 0);
      arrowShape.bezierCurveTo(0.4, 0.175, -0.4, 0.175, -0.5, 0);
      var arrowGeom = new THREE.ShapeGeometry(arrowShape);
      arrowGeom.rotateZ(-Math.PI * 0.48);
      var arrow = new THREE.Mesh(arrowGeom, closinesMat);
      arrow.position.x += 1.4;
      closinesRing.add(arrow);
      this.scene.closinesRing = closinesRing;
      this.loadGltfs(function () {
        campus.load().then(function (campus) {
          _this2.scene.bbox = campus.geometry.bbox;

          _this2.scene.initPosition();

          if (_this2.mode !== "pointer") _this2.scene.camera.centerOn(campus);
          var canvas = document.getElementById("canvas");

          if (canvas.clientWidth < canvas.clientHeight) {
            _this2.scene.state.worldScale = Math.min(1, (campus.yScale(1) - campus.yScale(0)) / 1);
          } else {
            _this2.scene.state.worldScale = Math.min(1, (campus.xScale(1) - campus.xScale(0)) / 1);
          }

          if (_this2.scene.legoPiece) {
            var _this2$scene$legoPiec, _this2$scene$legoShad;

            var args = Array.apply(null, Array(3)).map(function (d) {
              return _this2.scene.state.worldScale;
            });

            (_this2$scene$legoPiec = _this2.scene.legoPiece.scale).set.apply(_this2$scene$legoPiec, _toConsumableArray(args));

            (_this2$scene$legoShad = _this2.scene.legoShadow.scale).set.apply(_this2$scene$legoShad, _toConsumableArray(args));
          }

          Promise.all([buildings.load(), grass.load(), paths.load(), sphericTrees.load(), tallTrees.load(), lego.load(), pieces.load(_this2.playerData.id)]).then(function (layers) {
            sphericCanopies.parse(sphericTrees.json);
            tallCanopies.parse(tallTrees.json);

            _this2.scene.build();

            _this2.scene.render();

            _this2.paint();

            _this2.target = pieces.getTargetLocation(_this2.playerData);
          });
        });
      });
      this.scene.addLayer(campus);
      this.scene.addLayer(buildings);
      this.scene.addLayer(grass);
      this.scene.addLayer(paths);
      this.scene.addLayer(sphericTrees);
      this.scene.addLayer(sphericCanopies);
      this.scene.addLayer(tallTrees);
      this.scene.addLayer(tallCanopies);
      this.scene.addLayer(lego);
      this.scene.addLayer(pieces);
    }
  }, {
    key: "loadGltfs",
    value: function loadGltfs(callback) {
      var _this3 = this;

      if (this.mode === "pointer") {
        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load("/static/gltf/piezaLego.gltf", function (gltf) {
          var piece = gltf.scene;
          gltfLoader.load("/static/gltf/arm.gltf", function (gltf) {
            var armRight = gltf.scene;
            armRight.rotation.reorder("ZYX");
            armRight.rotation.x = Math.PI * 0.3;
            armRight.scale.set(1.3, 1.3, 1.3);
            piece.position.fromArray(_this3.scene.camera.position.toArray());
            piece.position.z = 1;
            piece.rotation.x = Math.PI * 0.5;
            var pieceShadow = piece.clone();
            piece.children.forEach(function (child) {
              if (child.type === "Mesh") {
                child.material = new THREE.MeshLambertMaterial({
                  color: "rgb(".concat(_this3.playerData.red, ", ").concat(_this3.playerData.green, ", ").concat(_this3.playerData.blue, ")")
                });
              }
            });
            pieceShadow.children.forEach(function (child) {
              if (child.type === "Mesh") {
                child.material = new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                  opacity: 0.3,
                  transparent: true
                });
              }
            });
            armRight.children.forEach(function (child) {
              if (child.type === "Mesh") {
                child.material = new THREE.MeshToonMaterial({
                  color: "rgb(240, 200, 160)",
                  side: THREE.DoubleSide
                });
              }
            });
            var armLeft = armRight.clone();
            armLeft.scale.x = armLeft.scale.x * -1;

            _this3.scene.add(piece);

            _this3.scene.add(armRight);

            _this3.scene.add(armLeft);

            _this3.scene.legoPiece = piece;
            _this3.scene.legoShadow = pieceShadow;
            _this3.scene.armRight = armRight;
            _this3.scene.armLeft = armLeft;
            callback.call(_this3);
          });
        });
      } else {
        // if (this.mode === "cover") this.scene.add(this.scene.marker);
        callback.call(this);
      }
    }
  }, {
    key: "distanceToTarget",
    value: function distanceToTarget(target) {
      this.scene.legoShadow.updateMatrixWorld();
      var position = this.scene.legoShadow.position;
      var distance = position.distanceTo(target);
      return distance;
    }
  }, {
    key: "onControlsChange",
    value: function onControlsChange(ev) {
      if (!this.done && this.scene.state.mode === "pointer" && this.scene.control.state.isOnTatami) {
        var distance = this.distanceToTarget(this.target);
        this.scene.controls.pointer.distance = distance;
        var xDelta = this.scene.closinesRing.position.x - this.target.x;
        var yDelta = this.scene.closinesRing.position.y - this.target.y;
        var targetBearing;

        if (yDelta > 0) {
          targetBearing = Math.atan(xDelta / yDelta);

          if (xDelta < 0) {
            targetBearing = Math.PI * 1.5 - targetBearing;
          } else {
            targetBearing = Math.PI * 1.5 - targetBearing;
          }
        } else {
          targetBearing = Math.atan(yDelta / xDelta);

          if (xDelta > 0) {
            targetBearing += Math.PI;
          }
        }

        this.scene.closinesRing.rotation.z = targetBearing;

        if (distance <= 0.4) {
          this.scene.legoShadow.children.forEach(function (child) {
            child.material.color.setHex(0x00ff00);
          });
          this.isOnTarget = true;
          this.paint();
        } else {
          this.scene.legoShadow.children.forEach(function (child) {
            child.material.color.setHex(0xff0000);
          });
          this.paint();
          this.isOnTarget = false;
        }
      } else {
        this.scene.controls.pointer.distance = 1e3;
      }

      this.paint();
    }
  }]);

  return Game;
}();

export { Game as default };