//>>excludeStart("release");
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
//>>excludeEnd("release");

define(function() {
    'use strict';
    return {
        f: function (obj) {
            return typeof obj === 'function';
        }
    };
});