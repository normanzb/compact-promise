#Compact implementation of Promise/A+

With a sub set API of [RSVP.js](https://github.com/tildeio/rsvp.js/)/[when.js](https://github.com/cujojs/when) and very small footprint... (959 bytes after minified and gzipped)

#API

* `Defer()` - constructor of defer.
    * `Defer.prototype.resolve(value)` - Resolve the defer with `value`.
    * `Defer.prototype.reject(error)` - Reject the defer with `error`.
* `Defer.all(promises)` - Resolve when the all the promises in the `promises` array are resolved, reject when any of the `promises` is rejected.
* `Defer.onError` - Overwrite this property with a function so that the function gets called whenever an error or exception is detected.
* `Defer.Promise(func)` - constructor of a promise, `func` will be called once instantiation is done with 2 functions as its parameters -- `resolve` and `reject`. Call each function respectly to resolve or reject the promise.
    * `Defer.Promise.prototype.then(resolveCallback, rejectCallback)` - Invoke `resolveCallback` when the promise is resolved, the vice versa for `rejectCallback`.

#Sub set of Promise/A+ Compliant

Compliant with a sub set of Promise/A+ and passed following tests:

2.1, 2.2, 2.3.1, 2.3.2
It fails on 2.3.3 and 2.3.4

TODO: try to make implementation of setImmediate and its polyfill optional to save some bytes.

#Tests

To run Promise/A+ tests
`npm test`

To run extended tests
`npm run test-ext`