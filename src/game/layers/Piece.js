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

Piece.prototype.load = function(piece_id) {
  return fetch("static/data/piece.geojson", {
    method: "GET",
  }).then(res => {
    return res.json().then(this.parse);
  });
};

export default Piece;
