'use strict';

var randomNatural = require('random-natural');

var MIN = 0;
var MAX = 59;

module.exports = function (options) {

  if (options) {
    options.min = options.min ? randomNatural.fixme(options.min, MIN, MAX, true) : MIN;
    options.max = options.max ? randomNatural.fixme(options.max, MIN, MAX, false) : MAX;

    options = {
      min: options.min,
      max: options.max
    };
  } else {
    options = { min: MIN, max: MAX };
  }

  options.inspected = true;

  return randomNatural(options);
};
