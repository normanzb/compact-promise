//>>excludeStart("release");
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
//>>excludeEnd("release");

define(['../util'], function(util){
    'use strict';

    function getResultChecker(results, index, resolve, length, count) {
        return function check(result) {
            results[index] = result;
            count.value++;
            if (length.value === count.value) {
                resolve(results);
            }
        };
    }

    return function(Defer){
        Defer.all = function (promises) {
            return new Defer.Promise(function (rs, rj) {
                var length = {value: promises.length};
                var count = {value: 0};
                var results = [];
                for (var l = promises.length; l--;) {
                    if (!(promises[l] && util.f(promises[l].then))) {
                        results[l] = promises[l];
                        length.value--;
                    } else {
                        promises[l].then(getResultChecker(results, l, rs, length, count), rj);
                    }
                }
                if (length.value <= 0 || length.value === count.value) {
                    rs(results);
                    return;
                }
            });
        };
    };
});