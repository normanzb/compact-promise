define(function(){
    'use strict';

    var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';
    var Func = Function, g = (new Func('return this'))();
    var tickPending = false, tickQueue = [];

    function isFunc(obj) {
        return typeof obj === FUNCTION;
    }

    function tick(func) {
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
    }

    function safeRun(func, value, defer) {
        var ret;
        try{
            ret = func.call(undefined, value);
        }
        catch(ex){
            if (isFunc(Defer.onError)){
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

    function resolve() {
        var me = this;        
        if (me.promise[RESOLVED] || me.promise[REJECTED]){
            return;
        }

        me.promise.result = me.promise.result || arguments[0];
        me.promise[RESOLVED] = true;

        tick(function(){
            for (var i = 0; i < me.promise._s.length; i++) {
                safeRun(me.promise._s[i], me.promise.result, me.promise._d[i]);
            }

            reset.call(me);
        });
    }

    function reject(){
        var me = this;
        if (me.promise[RESOLVED] || me.promise[REJECTED]){
            return;
        }

        me.promise.error = me.promise.error || arguments[0];
        me.promise[REJECTED] = true;

        tick(function(){
            for (var i = 0; i < me.promise._f.length; i++) {
                safeRun(me.promise._f[i], me.promise.error, me.promise._d[i]);
            }

            reset.call(me);
        });
    }

    function Defer(promise) {
        if (!(this instanceof Defer)) {
            return new Defer(promise);
        }
        var me = this;
        me.promise = (promise && isFunc(promise.then))?promise:new Promise(me);
        me.resolve = function(value){
            promiseAwareCall(resolve, reject, resolve, me, value);
        };
        me.reject = function(value){
            promiseAwareCall(resolve, reject, reject, me, value);
        };
    }

    function Promise(arg) {
        if (!(this instanceof Promise)) {
            return new Promise(arg);
        }
        this._s = [];
        this._f = [];
        this._d = [];
        this._defer = (arg && arg instanceof Defer)?arg:new Defer(this);
        this.result = null;
        this.error = null;
        if (isFunc(arg)) {
            try{
                arg.call(this, this._defer.resolve, this._defer.reject);
            }
            catch(ex){
                this._defer.reject(ex);
            }
        }
    }

    function createResultHandlerWrapper(handler, defer) {
        return function (value) {
            tick(function(){
                var res = safeRun(handler, value, defer);
                promiseAwareCall(defer.resolve, defer.reject, defer.resolve, defer, res);
            });
        };
    }

    function promiseAwareCall(resolve, reject, defaultSolution, context, result) {
        var then;
        try{
            then = result && result.then;
        }
        catch(ex){
            reject.apply(context, [ex]);
            return;
        }
        if (result === context.promise) {
            reject.apply(context, [new TypeError(1)]);
        }
        else if (isFunc(then)){
            try{
                then.call(result, function(){
                    resolve.apply(context, arguments);
                }, function(){
                    reject.apply(context, arguments);
                });
            }
            catch(ex) {
                if (isFunc(Defer.onError)){
                    Defer.onError(ex);
                }
                reject.call(context, ex);
            }
        }
        else {
            defaultSolution.apply(context, (result === undefined?[]:[result]));
        }
    }

    Promise[PROTOTYPE].then = function(onSuccess, onFailure) {
        var defer = new Defer();
        var me = this;
        var handleSuccess, handleFail;

        me._d.push(defer);

        if (isFunc(onSuccess)){
            handleSuccess = createResultHandlerWrapper.call(me, onSuccess, defer);
        }
        else{
            handleSuccess = defer.resolve;
        }

        if (me[RESOLVED]) {
            handleSuccess.call(null, me.result);
        } else {
            me._s.push(handleSuccess);
        }

        if (isFunc(onFailure)){
            handleFail = createResultHandlerWrapper.call(me, onFailure, defer);
        }
        else {
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
    Defer.resolve = function(v){
        var result = new Defer();
        result.resolve(v);
        return result.promise;
    };
    Defer.reject = function(v){
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
            var length = {value: promises.length};
            var count = {value: 0};
            var results = [];
            for (var l = promises.length; l--;) {
                if (!(promises[l] && isFunc(promises[l].then))) {
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
});