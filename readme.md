# Compact implementation of Promise/A+

[<img align="right" alt="Promises/A+ 1.0 compliant" src="https://rawgit.com/promises-aplus/promises-spec/master/logo.svg" width="50" valign="baseline">](http://promisesaplus.com/)

Compact Promise is a lightweight Promise/A+ compliant implementation with very small footprint (870 bytes for smallest compilation after minified and gzipped).

# References

* `Defer()` - Constructor of defer.
    * `Defer.prototype.resolve(value)` - Resolve the defer with `value`.
    * `Defer.prototype.reject(error)` - Reject the defer with `error`.
* `Defer.onError` - Overwrite this property with a function so that the function gets called whenever an error or exception is detected.
* `Defer.Promise(func)` - constructor of a promise, `func` will be called once instantiation is done with 2 functions as its parameters -- `resolve` and `reject`. Call each function respectly to resolve or reject the promise.
    * `Defer.Promise.prototype.then(resolveCallback, rejectCallback)` - Invoke `resolveCallback` when the promise is resolved, the vice versa for `rejectCallback`.
* `Defer.Promise.all(promises)` - Resolve when the all the promises in the `promises` array are resolved, reject when any of the `promises` is rejected.
* `Defer.Promise.resolve(promise)` - Return a resolved promise when `promise` is resolved or null.
* `Defer.Promise.reject(reason)` - Return a reject promise with reason as its error.

# Compilation and Promise/A+ Compliant

The complete version of Compact Promise is fully compliant with Promise/A+. However lots of developers may find that its unnecessary to bring in all the standard and extended features into the project, as most of them probably never used.

To reduce the extra fat, Compact Promise is also compiled with/without certain function sets so that you can pick up just what you need for your next project. 

Here is list of compliancy of each compilations:

* Default - full compliant, with extension methods such as Defer.all()
* notick - Promise/A+ 3.1 is excluded to avoid to implement platform specific micro-task `nextTick` or macro-task `setImmediate`, as a lot of developers has already pointed out, the cross platform implementation of those, at the moment is bloated with feature detections, workarounds and hacks, which means it doesn't fit the ideology of being a compact, lightweight, use anywhere library. And even so, it still doesn't support a lot of older platforms and mobile platforms and at those cases it fallbacks to `setTimeout`, which means very slow execution and performance. By not implementing Promise/A+ 3.1, in a lot of cases, its not just make page loads faster, run faster, but also avoid unnecessary async calls so it makes debugging a lot of easier as well.
* noext - No extension method such as Defer.all(), these methods are not part of the standard, they are added because they are very common in the other similiar libs.
* noumd - No UMD header, plain Javascript!

# Bower

`bower install compact-promise --save`

# Tests

To run full tests

`npm run test`

To run Promise/A+ tests

`npm run test-basic`

To run extended tests

`npm run test-ext`
