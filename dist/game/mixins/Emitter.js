function Emitter(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    throw "Invalid constructor arguments";
  }

  this._el = el;
}

Emitter.prototype.$on = function (event, callback) {
  this._el.addEventListener(event, callback);
};

Emitter.prototype.$off = function (event, callback) {
  this._el.removeEventListener(event, callback);
};

Emitter.prototype.$emit = function (event, data) {
  this._el.dispatchEvent(new CustomEvent(event, {
    detail: data
  }));
};

Emitter.asEmitter = function (obj) {
  var emitter = new Emitter(document.createElement("div"));
  obj.$on = emitter.$on.bind(emitter);
  obj.$off = emitter.$off.bind(emitter);
  obj.$emit = emitter.$emit.bind(emitter);
  return obj;
};

export default Emitter;