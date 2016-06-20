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
Defer = requirejs('../src/Defer.js');
console.log(Defer);
var defer = Defer;
var resolve = Defer.resolve;
var reject = Defer.reject;

module.exports = {
  resolved: resolve,
  rejected: reject,
  deferred: defer
};