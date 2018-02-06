'use strict';

var extend = require('xtend');

module.exports = function (el, onOver, onOut) {
  var x, y, pX, pY;
  var h = {},
    state = 0,
    timer = 0;

  var options = {
    sensitivity: 7,
    interval: 100,
    timeout: 0
  };

  function tracker(e) {
    x = e.clientX;
    y = e.clientY;
  }

  function compare(el, e, callback, desiredStatus) {
    if (timer) timer = clearTimeout(timer);
    if ((Math.abs(pX - x) + Math.abs(pY - y)) < options.sensitivity) {
      state = desiredStatus;
      return callback.call(el, e);
    } else {
      pX = x;
      pY = y;
      timer = setTimeout(function () {
        compare(el, e, callback, desiredStatus);
      }, options.interval);
    }
  }

  // Public methods
  h.options = function (opt) {
    options = extend({}, options, opt);
    return h;
  };

  function dispatchOver(e) {
    if (timer) timer = clearTimeout(timer);
    el.removeEventListener('mousemove', tracker, false);

    if (state !== 'hovering' || typeof state === 'undefined') {
      pX = e.clientX;
      pY = e.clientY;

      el.addEventListener('mousemove', tracker, false);

      timer = setTimeout(function () {
        compare(el, e, onOver, 'hovering');
      }, options.interval);
    }

    return this;
  }

  function dispatchOut(e) {
    if (timer) timer = clearTimeout(timer);
    document.body.addEventListener('mousemove', tracker, false);

    if (state === 'hovering') {
      timer = setTimeout(function () {
        compare(el, e, onOut, 'out');
      }, options.timeout);
    }

    return this;
  }

  h.remove = function () {
    if (!el) return;
    el.removeEventListener('mouseover', dispatchOver, false);
    el.removeEventListener('mouseout', dispatchOut, false);
  };

  if (el) {
    el.addEventListener('mouseover', dispatchOver, false);
    el.addEventListener('mouseout', dispatchOut, false);
  }

  return h;
};
