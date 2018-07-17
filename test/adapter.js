var Defer;
var g = (new Function('return this'))();
var requirejs = require('requirejs');
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

var assert = require('assert');
var sinon = require('sinon');
if (typeof g.define !== 'function') {
    g.define = requirejs.define;
}
Promise = requirejs('../src/Promise.js');
console.log(Promise);
var resolve = Promise.resolve;
var reject = Promise.reject;

module.exports = {
  resolved: resolve,
  rejected: reject,
  deferred: Promise.Defer
};