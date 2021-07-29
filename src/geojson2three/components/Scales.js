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

function GeoScale(domain) {
  const _domain = domain[1] - domain[0];
  return function (val) {
    return (val / 180) * _domain;
  };
}

function ProjectedScale(range, domain) {
  const _domain = domain[1] - domain[0];
  const _range = range[1] - range[0];
  return function (val) {
    return ((val - range[0]) / _range) * _domain;
  };
}

export { GeoScale, ProjectedScale, Scale };
