define([
    'src/Promise'
], function(
    Promise
) {
    'use strict';

    function assertRejection(promise) {
        return promise.then(function(){
            expect('rejection, but got fulfillment').to.equal(false);
        }, function(reason){
            expect(reason instanceof Error).to.equal(true);
        });
    }


    return describe('Compact Promise', function(){
        describe('Promise', function(){
            describe('Promise.all', function(){
                it('should exist', function() {
                    expect(Promise.all).a('function');
                });

                it('throws when not passed an array', function(done) {
                    var nothing = assertRejection(Promise.all());
                    // doubt if these 2 are necessary, they are copied from rsvp
                    // var string  = assertRejection(Promise.all(''));
                    // var object  = assertRejection(Promise.all({}));

                    Promise.all([
                        nothing
                        // string,
                        // object
                    ]).then(function(){ 
                        done(); 
                    });
                });

                it('works with plan pojo input', function(done) {
                    Promise.all([{},{a:1}]).then(function(result) {
                        expect(result).to.eql([{},{a:1}]);
                        done();
                    });
                });

                it('fulfilled only after all of the other promises are fulfilled', function(done) {
                    var firstResolved, secondResolved, firstResolver, secondResolver;

                    var first = new Promise(function(resolve) {
                        firstResolver = resolve;
                    });
                    first.then(function(value) {
                        firstResolved = value;
                    });

                    var second = new Promise(function(resolve) {
                        secondResolver = resolve;
                    });
                    second.then(function(value) {
                        secondResolved = value;
                    });

                    setTimeout(function() {
                        firstResolver(true);
                    }, 0);

                    setTimeout(function() {
                        secondResolver(true);
                    }, 0);

                    Promise.all([first, second]).then(function() {
                        expect(firstResolved).to.equal(true);
                        expect(secondResolved).to.equal(true);
                        done();
                    });
                });

                it('rejected as soon as a promise is rejected', function(done) {
                    var firstResolver, secondResolver;
                    var firstWasRejected = false, secondCompleted = false;

                    var first = new Promise(function(resolve, reject) {
                        firstResolver = { resolve: resolve, reject: reject };
                    });

                    var second = new Promise(function(resolve, reject) {
                        secondResolver = { resolve: resolve, reject: reject };
                    });

                    first.then(null, function(){
                        firstWasRejected = true;
                    });

                    second.then(function(){
                        secondCompleted = true;
                        done();
                    }, function(){
                        secondCompleted = true;
                        done();
                    });

                    Promise.all([first, second]).then(function() {
                        expect('should not run').to.equal(false);
                    }, function() {
                        expect(firstWasRejected).to.equal(true);
                        expect(secondCompleted).to.equal(false);
                    });

                    setTimeout(function() {
                        firstResolver.reject({});
                    }, 0);

                    setTimeout(function() {
                        secondResolver.resolve({});
                    }, 1000);
                });

                it('passes the resolved values of each promise to the callback in the correct order', function(done) {
                    var firstResolver, secondResolver, thirdResolver;

                    var first = new Promise(function(resolve, reject) {
                    firstResolver = { resolve: resolve, reject: reject };
                    });

                    var second = new Promise(function(resolve, reject) {
                    secondResolver = { resolve: resolve, reject: reject };
                    });

                    var third = new Promise(function(resolve, reject) {
                    thirdResolver = { resolve: resolve, reject: reject };
                    });

                    thirdResolver.resolve(3);
                    firstResolver.resolve(1);
                    secondResolver.resolve(2);

                    Promise.all([first, second, third]).then(function(results) {
                        expect(results.length).to.equal(3);
                        expect(results[0]).to.equal(1);
                        expect(results[1]).to.equal(2);
                        expect(results[2]).to.equal(3);
                        done();
                    });
                });

                it('resolves an empty array passed to all()', function(done) {
                    Promise.all([]).then(function(results) {
                        expect(results.length).to.equal(0);
                        done();
                    });
                });

                it('works with null', function(done) {
                    Promise.all([null]).then(function(results) {
                        expect(results[0]).to.equal(null);
                        done();
                    });
                });

                it('works with a mix of promises and thenables and non-promises', function(done) {
                    var promise = new Promise(function(resolve) { 
                        resolve(1); 
                    });
                    var syncThenable = { 
                        then: function (onFulfilled) { 
                            onFulfilled(2); 
                        }
                    };
                    var asyncThenable = { 
                        then: function (onFulfilled) { 
                            setTimeout(function() { onFulfilled(3); }, 0); 
                        } 
                    };
                    var nonPromise = 4;

                    Promise
                    .all([promise, syncThenable, asyncThenable, nonPromise])
                    .then(function(results) {
                        expect(results).to.be.eql([1, 2, 3, 4]);
                        done();
                    });
                });
            });
            
        });
    });
});