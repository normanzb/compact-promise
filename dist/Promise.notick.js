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
    root['Promise'] = factory();
  }
}(this, function () {

var util;

util = {
    f: function (obj) {
        return typeof obj === 'function';
    }
};
var extAll;

extAll = function (util) {
    function getResultChecker(results, index, resolve, length, count) {
        return function check(result) {
            results[index] = result;
            count.value++;
            if (length.value === count.value) {
                resolve(results);
            }
        };
    }
    return function (Promise) {
        Promise.all = function (promises) {
            return new Promise(function (rs, rj) {
                var length = { value: promises.length };
                var count = { value: 0 };
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
}(util);
var tickSimple;

tickSimple = function (func) {
    func();
};
var Promise;

Promise = function (allExt, util, tick) {
    var PROTOTYPE = 'prototype', RESOLVE = 'resolve', REJECT = 'reject', RESOLVED = 'resolved', REJECTED = 'rejected', PENDING = 'pending', PROMISE = 'promise', CALL = 'call', RESULT = 'result', ERROR = 'error', undef;
    function safeRun(func, value, defer) {
        var ret;
        try {
            ret = func[CALL](undef, value);
        } catch (ex) {
            handleError(ex);
            defer[REJECT](ex);
        }
        return ret;
    }
    function reset() {
        this[PROMISE]._s = [];
        this[PROMISE]._f = [];
        this[PROMISE]._d = [];
    }
    function handleError(err) {
        if (util.f(Promise.onError)) {
            Promise.onError(err);
        }
    }
    function resolve(result) {
        var me = this;
        var promise = me[PROMISE];
        function callback(finalResult) {
            promise[RESULT] = finalResult;
            promise[RESOLVED] = true;
            promise[PENDING] = false;
            tick(function () {
                for (var i = 0; i < promise._s.length; i++) {
                    safeRun(promise._s[i], promise[RESULT], promise._d[i]);
                }
                reset[CALL](me);
            });
        }
        function recursiveCall(recursiveResult) {
            promiseAwareCall(recursiveCall, function (error) {
                promise[PENDING] = false;
                reject[CALL](me, error);
            }, callback, me, recursiveResult);
        }
        if (promise[RESOLVED] || promise[REJECTED] || promise[PENDING]) {
            return;
        }
        promise[PENDING] = true;
        recursiveCall(result);
    }
    function reject(error) {
        var me = this;
        var promise = me[PROMISE];
        function callback(finalError) {
            promise[ERROR] = finalError;
            promise[REJECTED] = true;
            promise[PENDING] = false;
            tick(function () {
                for (var i = 0; i < promise._f.length; i++) {
                    safeRun(promise._f[i], promise[ERROR], promise._d[i]);
                }
                reset[CALL](me);
            });
        }
        if (promise[RESOLVED] || promise[REJECTED] || promise[PENDING]) {
            return;
        }
        promise[PENDING] = true;
        callback(error);
    }
    function createResultHandlerWrapper(handler, defer) {
        return function (value) {
            tick(function () {
                var res = safeRun(handler, value, defer);
                promiseAwareCall(defer[RESOLVE], defer[REJECT], defer[RESOLVE], defer, res);
            });
        };
    }
    function promiseAwareCall(resolve, reject, defaultSolution, context, result) {
        var then, handled;
        try {
            then = (typeof result === 'object' || util.f(result)) && result && result.then;
        } catch (ex) {
            handleError(ex);
            reject[CALL](context, ex);
            return;
        }
        if (result === context[PROMISE]) {
            reject[CALL](context, new TypeError(1));
        } else if (util.f(then)) {
            try {
                then[CALL](result, function (newResult) {
                    if (handled) {
                        return;
                    }
                    handled = true;
                    resolve[CALL](context, newResult);
                }, function (newError) {
                    if (handled) {
                        return;
                    }
                    handled = true;
                    reject[CALL](context, newError);
                });
            } catch (ex) {
                if (handled) {
                    return;
                }
                handled = true;
                handleError(ex);
                reject[CALL](context, ex);
            }
        } else {
            if (result === undef) {
                defaultSolution[CALL](context);
            } else {
                defaultSolution[CALL](context, result);
            }
        }
    }
    function Defer(promise) {
        if (!(this instanceof Defer)) {
            return new Defer(promise);
        }
        var me = this;
        me[PROMISE] = promise && util.f(promise.then) ? promise : new Promise(me);
        me[RESOLVE] = function (value) {
            resolve[CALL](me, value);
        };
        me[REJECT] = function (value) {
            reject[CALL](me, value);
        };
    }
    function Promise(arg) {
        if (!(this instanceof Promise)) {
            return new Promise(arg);
        }
        this._s = [];
        this._f = [];
        this._d = [];
        this._defer = arg && arg instanceof Defer ? arg : new Defer(this);
        this[RESOLVED] = false;
        this[REJECTED] = false;
        this[PENDING] = false;
        this[RESULT] = null;
        this[ERROR] = null;
        if (util.f(arg)) {
            try {
                arg[CALL](this, this._defer[RESOLVE], this._defer[REJECT]);
            } catch (ex) {
                handleError(ex);
                this._defer[REJECT](ex);
            }
        }
    }
    Promise[PROTOTYPE].then = function (onSuccess, onFailure) {
        var defer = new Defer();
        var me = this;
        var handleSuccess, handleFail;
        me._d.push(defer);
        if (!me[REJECTED]) {
            if (util.f(onSuccess)) {
                handleSuccess = createResultHandlerWrapper[CALL](me, onSuccess, defer);
            } else {
                handleSuccess = defer[RESOLVE];
            }
            if (me[RESOLVED]) {
                handleSuccess[CALL](null, me[RESULT]);
            } else {
                me._s.push(handleSuccess);
            }
        }
        if (!me[RESOLVED]) {
            if (util.f(onFailure)) {
                handleFail = createResultHandlerWrapper[CALL](me, onFailure, defer);
            } else {
                handleFail = defer[REJECT];
            }
            if (me[REJECTED]) {
                handleFail[CALL](null, me[ERROR]);
            } else {
                me._f.push(handleFail);
            }
        }
        return defer[PROMISE];
    };
    Promise.Defer = Defer;
    Promise[RESOLVE] = function (v) {
        var result = new Defer();
        result[RESOLVE](v);
        return result[PROMISE];
    };
    Promise[REJECT] = function (v) {
        var result = new Defer();
        result[REJECT](v);
        return result[PROMISE];
    };
    allExt(Promise);
    return Promise;
}(extAll, util, tickSimple);

return Promise;

}));
