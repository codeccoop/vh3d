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

var Camera = /*#__PURE__*/function (_THREE$PerspectiveCam) {
  _inherits(Camera, _THREE$PerspectiveCam);

  var _super = _createSuper(Camera);

  function Camera() {
    var _this;

    _classCallCheck(this, Camera);

    _this = _super.apply(this, arguments);

    _this.up.set(0, 0, 1);

    return _this;
  }

  _createClass(Camera, [{
    key: "centerOn",
    value: function centerOn(layer) {
      var bbox = layer.geometry.bbox.get();
      var x = (layer.xScale(bbox.center[0] + layer.xScale._range / 2) - layer.xScale(bbox.center[0] - layer.xScale._range / 2)) / 2;
      var y = (layer.yScale(bbox.center[1] + layer.yScale._range / 2) - layer.yScale(bbox.center[1] - layer.yScale._range / 2)) / 2;
      var span = Math.max(layer.xScale._range, layer.yScale._range);
      var fov = this.fov / 360 * Math.PI * 2;
      var z = Math.sin((Math.PI - fov) / 2) / (Math.sin(fov) / span);
      this.position.set(x * 1.4, y * -1.5, z * 0.3);
      this.lookAt(x, y, 0);

      if (this.parentControl && this.parentControl.target) {
        this.parentControl.target.set(x, y, 0);
        this.parentControl.update();
      }
    }
  }]);

  return Camera;
}(THREE.PerspectiveCamera);

export default Camera;