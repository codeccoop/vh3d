import Layer from "../geojson2three/components/Layer.js";

function Buildings(settings) {
  settings = settings || {};
  settings.z = "alt";
  settings.zFactor = 3;
  settings.base = "base";
  settings.color = function (feat) {
    switch (feat.properties.id) {
      case 1:
        return 0xffc800;
        break;
      case 2:
        return 0x57ee59;
        break;
      case 3:
      case 9:
        return 0x5bbdfb;
        break;
      case 4:
        return 0xcd24a0;
        break;
      case 5:
        return 0xf33d7c;
        break;
      case 6:
        return 0xf15366;
        break;
      case 7:
        return 0xff9600;
        break;
      case 8:
        return 0xcd24a0;
        break;
      case 9:
        return 0x6fe6d0;
        break;
      case 10:
        return 0x6ee5ec;
        break;
      default:
        return 0x888888;
        break;
    }
  };
  Layer.call(this, settings);
}

Buildings.prototype = Object.create(Layer.prototype);

Buildings.prototype.load = function () {
  return fetch("/data/buildings.geojson", {
    method: "GET",
  }).then((res) => {
    return res.json().then(this.parse);
  });
};

export default Buildings;
