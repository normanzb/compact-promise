(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['Defer'] = factory();
  }
}(this, function () {

/*
 * A compact version of Promise
 */
var Defer = function () {
    'use strict';
    var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';
    function resolve() {
        var me = this;
        me.promise.result = arguments[0];
        if (me.promise[REJECTED]) {
            return;
        }
        me.promise[RESOLVED] = true;
        for (var i = 0; i < me.promise._s.length; i++) {
            me.promise._s[i].call(null, me.promise.result);
        }
        me.promise._s = [];
    }
    function reject() {
        var me = this;
        me.promise.error = arguments[0];
        if (me.promise[RESOLVED]) {
            return;
        }
        me.promise[REJECTED] = true;
        for (var i = 0; i < me.promise._f.length; i++) {
            me.promise._f[i].call(null, me.promise.error);
        }
        me.promise._f = [];
    }
    function Defer(promise) {
        if (!(this instanceof Defer)) {
            return new Defer(promise);
        }
        var me = this;
        me.promise = promise && 'then' in promise ? promise : new Promise(me);
        me.resolve = function () {
            return resolve.apply(me, arguments);
        };
        me.reject = function () {
            return reject.apply(me, arguments);
        };
    }
    function Promise(arg) {
        this._s = [];
        this._f = [];
        this._defer = arg && arg instanceof Defer ? arg : new Defer(this);
        this.result = null;
        this.error = null;
        if (typeof arg === FUNCTION) {
            try {
                arg.call(this, this._defer.resolve, this._defer.reject);
            } catch (ex) {
                this._defer.reject(ex);
            }
        }
    }
    function createResultHandlerWrapper(handler, defer) {
        var me = this;
        return function () {
            var res = handler.apply(me, arguments);
            if (res && typeof res.then === FUNCTION) {
                res.then(function () {
                    defer.resolve.apply(defer, arguments);
                }, function () {
                    defer.reject.apply(defer, arguments);
                });
            } else {
                defer.resolve.apply(defer, res == null ? [] : [res]);
            }
        };
    }
    Promise[PROTOTYPE].then = function (onSuccess, onFailure) {
        var defer = new Defer();
        var me = this;
        if (typeof onSuccess == FUNCTION) {
            var handleSuccess = createResultHandlerWrapper.call(me, onSuccess, defer);
            if (me[RESOLVED]) {
                handleSuccess.call(null, me.result);
            } else {
                me._s.push(handleSuccess);
            }
        }
        if (typeof onFailure == FUNCTION) {
            var handleFail = createResultHandlerWrapper.call(me, onFailure, defer);
            if (me[REJECTED]) {
                handleFail.call(null, me.error);
            } else {
                me._f.push(handleFail);
            }
        }
        return defer.promise;
    };
    Defer.Promise = Promise;
    Defer.resolve = function () {
        var result = new Defer();
        result.resolve();
        return result.promise;
    };
    Defer.all = function (promises) {
        return new Promise(function (rs, rj) {
            var length = promises.length;
            var count = 0;
            var results = [];
            function check(result) {
                results.push(result);
                count++;
                if (length === count) {
                    rs(results);
                }
            }
            for (var l = promises.length; l--;) {
                if (!('then' in promises[l])) {
                    length--;
                } else {
                    promises[l].then(check, rj);
                }
            }
            if (length <= 0) {
                rs();
                return;
            }
        });
    };
    return Defer;
}();

return Defer;

}));
