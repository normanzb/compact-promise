//>>excludeStart("release");
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
//>>excludeEnd("release");

define(function() {
    'use strict';
    var Func = Function, g = (new Func('return this'))();
    var tickPending = false, tickQueue = [];

    return function (func) {
        tickQueue.push(func);

        if (!tickPending) {
            tickPending = true;
            ((g.process && g.process.nextTick) || g.setImmediate || g.setTimeout)(function(){
                var q = tickQueue;
                tickQueue = [];
                tickPending = false;
                for(var i = 0; i < q.length; i++) {
                    q[i]();
                }
                q.length = 0;
            });
        }
    };
});