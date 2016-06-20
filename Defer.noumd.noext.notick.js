
var util = {
    f: function (obj) {
        return typeof obj === 'function';
    }
};

var extAll = function (util) {
    return function () {
    };
}(util);

var tickSmall = function (func) {
    func();
};

var Defer = function (allExt, util, tick) {
    var PROTOTYPE = 'prototype', RESOLVED = 'resolved', REJECTED = 'rejected', PENDING = 'pending';
    function safeRun(func, value, defer) {
        var ret;
        try {
            ret = func.call(undefined, value);
        } catch (ex) {
            if (util.f(Defer.onError)) {
                Defer.onError(ex);
            }
            defer.reject(ex);
        }
        return ret;
    }
    function reset() {
        this.promise._s = [];
        this.promise._f = [];
        this.promise._d = [];
    }
    function resolve(result) {
        var me = this;
        var promise = me.promise;
        function callback(finalResult) {
            promise.result = finalResult;
            promise[RESOLVED] = true;
            promise[PENDING] = false;
            tick(function () {
                for (var i = 0; i < promise._s.length; i++) {
                    safeRun(promise._s[i], promise.result, promise._d[i]);
                }
                reset.call(me);
            });
        }
        function recursiveCall(recursiveResult) {
            promiseAwareCall(recursiveCall, function (error) {
                promise[PENDING] = false;
                reject.call(me, error);
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
        var promise = me.promise;
        function callback(finalError) {
            promise.error = finalError;
            promise[REJECTED] = true;
            promise[PENDING] = false;
            tick(function () {
                for (var i = 0; i < promise._f.length; i++) {
                    safeRun(promise._f[i], promise.error, promise._d[i]);
                }
                reset.call(me);
            });
        }
        function recursiveCall(recursiveError) {
            promiseAwareCall(function (result) {
                promise[PENDING] = false;
                resolve.call(me, result);
            }, recursiveCall, callback, me, recursiveError);
        }
        if (promise[RESOLVED] || promise[REJECTED] || promise[PENDING]) {
            return;
        }
        promise[PENDING] = true;
        recursiveCall(error);
    }
    function Defer(promise) {
        if (!(this instanceof Defer)) {
            return new Defer(promise);
        }
        var me = this;
        me.promise = promise && util.f(promise.then) ? promise : new Promise(me);
        me.resolve = function (value) {
            resolve.call(me, value);
        };
        me.reject = function (value) {
            reject.call(me, value);
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
        this.result = null;
        this.error = null;
        if (util.f(arg)) {
            try {
                arg.call(this, this._defer.resolve, this._defer.reject);
            } catch (ex) {
                this._defer.reject(ex);
            }
        }
    }
    function createResultHandlerWrapper(handler, defer) {
        return function (value) {
            tick(function () {
                var res = safeRun(handler, value, defer);
                promiseAwareCall(defer.resolve, defer.reject, defer.resolve, defer, res);
            });
        };
    }
    function promiseAwareCall(resolve, reject, defaultSolution, context, result) {
        var then, handled;
        try {
            then = (typeof result === 'object' || util.f(result)) && result && result.then;
        } catch (ex) {
            reject.apply(context, [ex]);
            return;
        }
        if (result === context.promise) {
            reject.apply(context, [new TypeError(1)]);
        } else if (util.f(then)) {
            try {
                then.call(result, function (newResult) {
                    if (handled) {
                        return;
                    }
                    handled = true;
                    resolve.call(context, newResult);
                }, function (newError) {
                    if (handled) {
                        return;
                    }
                    handled = true;
                    reject.call(context, newError);
                });
            } catch (ex) {
                if (handled) {
                    return;
                }
                handled = true;
                if (util.f(Defer.onError)) {
                    Defer.onError(ex);
                }
                reject.call(context, ex);
            }
        } else {
            defaultSolution.apply(context, result === undefined ? [] : [result]);
        }
    }
    Promise[PROTOTYPE].then = function (onSuccess, onFailure) {
        var defer = new Defer();
        var me = this;
        var handleSuccess, handleFail;
        me._d.push(defer);
        if (!me[REJECTED]) {
            if (util.f(onSuccess)) {
                handleSuccess = createResultHandlerWrapper.call(me, onSuccess, defer);
            } else {
                handleSuccess = defer.resolve;
            }
            if (me[RESOLVED]) {
                handleSuccess.call(null, me.result);
            } else {
                me._s.push(handleSuccess);
            }
        }
        if (!me[RESOLVED]) {
            if (util.f(onFailure)) {
                handleFail = createResultHandlerWrapper.call(me, onFailure, defer);
            } else {
                handleFail = defer.reject;
            }
            if (me[REJECTED]) {
                handleFail.call(null, me.error);
            } else {
                me._f.push(handleFail);
            }
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
    allExt(Defer);
    return Defer;
}(extAll, util, tickSmall);
