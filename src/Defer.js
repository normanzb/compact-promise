/*
 * A compact version of Promise
 */
define(function(){
    'use strict';

    var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';

    function resolve() {
        var me = this;

        me.promise.result = arguments[0];
        
        if (me.promise[REJECTED]){
            return;
        }

        me.promise[RESOLVED] = true;
        for (var i = 0; i < me.promise._s.length; i++) {
            me.promise._s[i].call(null, me.promise.result);
        }
        me.promise._s = [];
    }

    function reject(){
        var me = this;

        me.promise.error = arguments[0];

        if (me.promise[RESOLVED]){
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
        me.promise = (promise && 'then' in promise)?promise:new Promise(me);
        me.resolve = function(){
            return resolve.apply(me, arguments);
        };
        me.reject = function(){
            return reject.apply(me, arguments);
        };
    }
    function Promise(arg) {
        this._s = [];
        this._f = [];
        this._defer = (arg && arg instanceof Defer)?arg:new Defer(this);
        this.result = null;
        this.error = null;
        if (typeof arg === FUNCTION) {
            try{
                arg.call(this, this._defer.resolve, this._defer.reject);
            }
            catch(ex){
                this._defer.reject(ex);
            }
        }
    }
    Promise[PROTOTYPE].then = function(onSuccess, onFailure) {
        var defer = new Defer();
        var me = this;

        if (typeof onSuccess == FUNCTION){
            var handleSuccess = function () {
                var res = onSuccess.apply(me, arguments);
                if (res && typeof res.then === FUNCTION){
                    res.then(function(){
                        defer.resolve.apply(defer, arguments);
                    });
                }
                else{
                    defer.resolve.apply(defer, (res == null ? [] : [res]));
                }
            };

            if (me[RESOLVED]) {
                handleSuccess.call(null, me.result);
            } else {
                me._s.push(handleSuccess);
            }
        }

        if (typeof onFailure == FUNCTION){
            var handleFail = function () {
                var res = onFailure.apply(me, arguments);
                if (res && typeof res.then === FUNCTION){
                    res.then(function(){
                        defer.resolve.apply(defer, arguments);
                    });
                }
                else{
                    defer.resolve.apply(defer, (res == null ? [] : [res]));
                }
            };

            if (me[REJECTED]) {
                handleFail.call(null, me.error);
            } else {
                me._f.push(handleFail);
            }
        }
        
        return defer.promise;
    };

    Defer.Promise = Promise;
    Defer.all = function(promises) {
        return new Promise(function(rs, rj){
            var length = promises.length;
            var count = 0;
            if (length <= 0) {
                rs();
                return;
            }
            function check() {
                count++;
                if (length === count) {
                    rs();
                }
            }
            for(var l = promises.length; l--;) {
                promises[l].then(check, rj);
            }
        });
    };
    return Defer;
});