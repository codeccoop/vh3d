function Scale(range, domain) {
  var _range = Math.abs(range[0] - range[1]);
  var _domain = Math.abs(domain[0] - domain[1]);
  var fn = function (value) {
    return ((value - domain[0]) / _domain) * _range - _range / 2;
  };

  fn.range = function () {
    return JSON.parse(JSON.stringify(range));
  };

  fn.domain = function () {
    return JSON.parse(JSON.stringify(domain));
  };

  return fn;
}

function AbsoluteScale(domain) {
  const _domain = domain[1] - domain[0];
  return function (val) {
    return (val / 180) * _domain;
  };
}

function RelativeScale(range, domain) {
  const _domain = domain[1] - domain[0];
  const _range = range[1] - range[0];
  const scale = function (val) {
    return ((val - range[0]) / _range) * _domain;
  };
  scale._domain = _domain;
  scale._range = _range;
  return scale;
}

function ProjectedScale(projection, range, domain) {
  const transformation = proj4(projection, "EPSG:4326");
  return function (coord) {
    return pixelScale(transformation.forward(coord));
  };
}

export { AbsoluteScale, RelativeScale, ProjectedScale, Scale };
