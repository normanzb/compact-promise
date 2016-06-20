#Compact implementation of Promise/A+

Promise/A+ compliant and very small footprint `Promise` implementation (870 bytes for smallest compilation after minified and gzipped), with a sub set extension API from [RSVP.js](https://github.com/tildeio/rsvp.js/)/[when.js](https://github.com/cujojs/when).



#API

* `Defer()` - constructor of defer.
    * `Defer.prototype.resolve(value)` - Resolve the defer with `value`.
    * `Defer.prototype.reject(error)` - Reject the defer with `error`.
* `Defer.all(promises)` - Resolve when the all the promises in the `promises` array are resolved, reject when any of the `promises` is rejected.
* `Defer.onError` - Overwrite this property with a function so that the function gets called whenever an error or exception is detected.
* `Defer.Promise(func)` - constructor of a promise, `func` will be called once instantiation is done with 2 functions as its parameters -- `resolve` and `reject`. Call each function respectly to resolve or reject the promise.
    * `Defer.Promise.prototype.then(resolveCallback, rejectCallback)` - Invoke `resolveCallback` when the promise is resolved, the vice versa for `rejectCallback`.

#Compilaton and Promise/A+ Compliant

Compact Promise is fully compliant with Promise/A+ if full version is used. However lots of developers may find that its unnecessary to bring in all the features, as most of them probably never used in some projects.

To reduce the extra fat, Compact Promise is compiled with different function sets so that you will always squeeze in the bits you really need! 

Here is list of compliancy of each compilations:

* Default - fully compliant, with extension method such as Defer.all()
* notick - Promise/A+ 3.1 is excluded to avoid platform specific `nextTick` implementation. In a lot of places, avoid `nextTick` will actually make debugging a lot of easier.
* noext - No extension method such as Defer.all(), these methods are not part of the standard, they are added because they are very common in the other similiar libs.
* noumd - No UMD header, plain Javascript!

#Bower

`bower install compact-promise --save`

#Tests

To run full tests

`npm run test`

To run Promise/A+ tests

`npm run test-basic`

To run extended tests

`npm run test-ext`