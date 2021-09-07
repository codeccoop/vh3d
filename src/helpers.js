export function throttle(ms, fn, context) {
  let lastTime = Date.now();
  const wrapper = function () {
    fn.apply(context);
  };
  let delayed;

  return function () {
    clearTimeout(delayed);
    const now = Date.now();
    if (now - lastTime > ms) {
      // fn.apply(context, arguments);
      fn.call(context);
      lastTime = Date.now();
    } else {
      delayed = setTimeout(wrapper, ms - (now - lastTime));
    }
  };
}
