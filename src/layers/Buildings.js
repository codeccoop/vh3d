import Layer from "../geojson2three/components/Layer.js";

function Buildings(settings) {
  settings = settings || {};
  settings.z = "alt";
  settings.zFactor = 5;
  settings.base = "base";
  settings.edges = true;
  settings.color = function (feat) {
    switch (feat.properties.id) {
      case 1:
        return 0xef9400;
        break;
      case 2:
        return 0x55a01a;
        break;
      case 3:
        return 0x4d9eda;
        break;
      case 4:
        return 0x730080;
        break;
      case 5:
        return 0xbf2378;
        break;
      case 6:
        return 0xd75c71;
        break;
      case 7:
        return 0xff9600;
        break;
      case 8:
        return 0x7b62c8;
        break;
      case 9:
        return 0x577dad;
        break;
      case 10:
        return 0x4caba5;
        break;
      case 11:
        return 0x17212b;
        break;
      case 12:
        return 0xe99e61;
        break;
      case 13:
        return 0x80151b;
        break;
      default:
        return 0x888888;
        break;
    }
  };
  settings.name = "buildings";
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
