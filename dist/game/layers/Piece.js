import Layer from "../geojson2three/components/Layer.js";

function Piece(settings) {
  settings = settings || {};
  settings.color = 0x0000ff;
  settings.name = "piece";
  settings.z = "alt";
  settings.base = 0;
  Layer.call(this, settings);
}

Piece.prototype = Object.create(Layer.prototype);

Piece.prototype.load = function (piece_id) {
  var _this = this;

  return fetch("/static/data/piece.geojson", {
    method: "GET"
  }).then(function (res) {
    return res.json().then(_this.parse);
  });
};

export default Piece;