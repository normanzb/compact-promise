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

var Defer = function () {
    'use strict';
    var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';
    function resolve() {
        var me = this;
        me.promise.result = me.promise.result || arguments[0];
        if (me.promise[RESOLVED] || me.promise[REJECTED]) {
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
        me.promise.error = me.promise.error || arguments[0];
        if (me.promise[RESOLVED] || me.promise[REJECTED]) {
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
        var handleSuccess, handleFail;
        if (typeof onSuccess == FUNCTION) {
            handleSuccess = createResultHandlerWrapper.call(me, onSuccess, defer);
        } else {
            handleSuccess = defer.resolve;
        }
        if (me[RESOLVED]) {
            handleSuccess.call(null, me.result);
        } else {
            me._s.push(handleSuccess);
        }
        if (typeof onFailure == FUNCTION) {
            handleFail = createResultHandlerWrapper.call(me, onFailure, defer);
        } else {
            handleFail = defer.reject;
        }
        if (me[REJECTED]) {
            handleFail.call(null, me.error);
        } else {
            me._f.push(handleFail);
        }
        return defer.promise;
    };
    Defer.Promise = Promise;
    Defer.resolve = function (v) {
        var result = new Defer();
        result.resolve(v);
        return result.promise;
    };
    Defer.reject = function (v) {
        var result = new Defer();
        result.reject(v);
        return result.promise;
    };
    function getResultChecker(results, index, resolve, length, count) {
        return function check(result) {
            results[index] = result;
            count.value++;
            if (length.value === count.value) {
                resolve(results);
            }
        };
    }
    Defer.all = function (promises) {
        return new Promise(function (rs, rj) {
            var length = { value: promises.length };
            var count = { value: 0 };
            var results = [];
            for (var l = promises.length; l--;) {
                if (!('then' in promises[l])) {
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
    return Defer;
}();

return Defer;

}));
