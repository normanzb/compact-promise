/*
 * A compact version of Promise
 */
var Promise = (function(){
    var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';
    function Promise() {
        this._s = [];
        this._f = [];
    }
    Promise[PROTOTYPE].then = function(onSuccess, onFailure) {
        var p = new Promise();
        var me = this;

        if (typeof onSuccess == FUNCTION){
            var handleSuccess = function () {
                var res = onSuccess.apply(me, arguments);
                if (res && typeof res.then === FUNCTION){
                    res.then(function(){
                        p.resolve.apply(p, arguments);
                    });
                }
                else{
                    p.resolve.apply(p, (res == null ? [] : [res]));
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
                        p.resolve.apply(p, arguments);
                    });
                }
                else{
                    p.resolve.apply(p, (res == null ? [] : [res]));
                }
            };

            if (me[REJECTED]) {
                handleFail.call(null, me.error);
            } else {
                me._f.push(handleFail);
            }
        }
        
        return p;
    };

    Promise[PROTOTYPE].resolve = function() {
        var me = this;

        me.result = arguments[0];
        
        if (me[REJECTED]){
            return;
        }

        me[RESOLVED] = true;
        for (var i = 0; i < me._s.length; i++) {
            me._s[i].call(null, me.result);
        }
        me._s = [];
    };
    Promise[PROTOTYPE].reject = function(){
        var me = this;

        me.error = arguments[0];

        if (me[RESOLVED]){
            return;
        }

        me[REJECTED] = true;
        for (var i = 0; i < me._f.length; i++) {
            me._f[i].call(null, me.error);
        }
        me._f = [];
    };
    return Promise;
})();