/*
 * A compact version of Promise
 */
function Promise() {
    this._successCallbacks = [];
    this._failureCallbacks = [];
}

Promise.prototype.then = function(onSuccess, onFailure) {
    var p;
    var me = this;
    p = new Promise();

    if (typeof onSuccess == 'function'){
        var handleSuccess = function () {
            var res = onSuccess.apply(me, arguments);
            if (res && typeof res.then === 'function'){
                res.then(function(){
                    p.resolve.apply(p, arguments);
                });
            }
            else{
                p.resolve.apply(p, (res == null ? [] : [res]));
            }
        };

        if (me._isSuccessed) {
            handleSuccess.call(null, me.result);
        } else {
            me._successCallbacks.push(handleSuccess);
        }
    }

    if (typeof onFailure == 'function'){
        var handleFail = function () {
            var res = onFailure.apply(me, arguments);
            if (res && typeof res.then === 'function'){
                res.then(function(){
                    p.resolve.apply(p, arguments);
                });
            }
            else{
                p.resolve.apply(p, (res == null ? [] : [res]));
            }
        };

        if (me._isFailed) {
            handleFail.call(null, me.error);
        } else {
            me._failureCallbacks.push(handleFail);
        }
    }
    
    return p;
};

Promise.prototype.resolve = function() {
    var me = this;

    me.result = arguments[0];
    
    if (me._isFailed){
        return;
    }

    me._isSuccessed = true;
    for (var i = 0; i < me._successCallbacks.length; i++) {
        me._successCallbacks[i].call(null, me.result);
    }
    me._successCallbacks = [];
};

Promise.prototype.reject = function(){
    var me = this;

    me.error = arguments[0];

    if (me._isSuccessed){
        return;
    }

    me._isFailed = true;
    for (var i = 0; i < me._failureCallbacks.length; i++) {
        me._failureCallbacks[i].call(null, me.error);
    }
    me._failureCallbacks = [];
};