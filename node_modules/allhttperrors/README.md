HTTPErrors
==========

This is a simple module to create HTTP error constructor based on Node's `http.STATUS_CODES` information.
How to use it:

    var errors = require( 'allhttperrors' );

    var e = new errors.UnauthorizedError();
    console.log( e.httpError ); // 401

    // ...
    next( new errors.NotFoundError() );
    // ... or:
    next( new errors.NotFoundError("The file specified could not be found") );
    // ... or:
    next( new errors.NotFoundError(
      { message: "The file specified could not be found", extraInfo: { fileName: 'someFile' } }
    ) );

The error names are based on the default messages set by nodejs, with strange characters stripped out and capitalisation added. See the bottom of this file for the full list of errors constructors created.

By default, each error constructor sets:

* `this.message`; if no parameter is passed, it's the name of the error. If a string is passed, then `this.message` will be assigned to it; if an object is passed, then this.message will be assigned `passedObject.message`.

* `this.httpError`; automatically set depending on the HTTP error

# The constructor

By looking at the code above, you probably noticed that the last form of constucting an error shows that the constructor's parameters are very flexible.
The constructor can be called in three forms:

 * `NotFoundError()`. This will create an error of type `NotFoundError`, where `this.message` is `Not found`.
 * `NotFoundError( 'Custom message' )`. This will create an error of type `NotFoundError`, where `this.message` is `Custom Message`.
 * `NotFoundError( { message: "Custom message", filename: 'log.txt' } )`. This will create an error of type `NotFoundError`, where `this.message` is `Custom Message` and `this.fileName` is `log.txt`.  Basically, the passed object will be mixed into the created object.

If you pass an `passedObject` to the constructor as a parameter, then every attribute of `passedObject` will be mixed into the object itself. This is really handy if you want to attach extra information to your error objects. If you are using express, your error handler might look into the `err` variable and use the extra information.

_Note: Only the first parameter is standard in the creation of the Error object. In Firefox, it is `new Error([message[, fileName[, lineNumber]]])`, in IE it is `new Error([number[, description]])`, in Chrome, `new Error(description, constr)`. I made the constructor as standard as possible: `new Error("Message")`, the basic use case, works._


# The full list

Here is a full list of error constructors defined by the module.
***NOTE:***: I realise that not all of them are errors. However, the main goal of this module is to create errors around HTTP statuses. I could:

 * either rename it into `allhttpstatuses` (but that wouldn't really highlight the purpose of the module, that is to create _errors_)
 * or take out the statuses that aren't errors (but that would imply taking out 100, all 200, but also take out 304 which isn't technically an error... do you see the issue here?)

I won't do either of them, as the goal of this module is to _create javascript errors around HTTP statuses_.

 * [100] `ContinueError`: Continue
 * [101] `SwitchingProtocolsError`: Switching Protocols
 * [102] `ProcessingError`: Processing
 * [200] `OKError`: OK
 * [201] `CreatedError`: Created
 * [202] `AcceptedError`: Accepted
 * [203] `NonAuthoritativeInformationError`: Non-Authoritative Information
 * [204] `NoContentError`: No Content
 * [205] `ResetContentError`: Reset Content
 * [206] `PartialContentError`: Partial Content
 * [207] `MultiStatusError`: Multi-Status
 * [300] `MultipleChoicesError`: Multiple Choices
 * [301] `MovedPermanentlyError`: Moved Permanently
 * [302] `MovedTemporarilyError`: Moved Temporarily
 * [303] `SeeOtherError`: See Other
 * [304] `NotModifiedError`: Not Modified
 * [305] `UseProxyError`: Use Proxy
 * [307] `TemporaryRedirectError`: Temporary Redirect
 * [400] `BadRequestError`: Bad Request
 * [401] `UnauthorizedError`: Unauthorized
 * [402] `PaymentRequiredError`: Payment Required
 * [403] `ForbiddenError`: Forbidden
 * [404] `NotFoundError`: Not Found
 * [405] `MethodNotAllowedError`: Method Not Allowed
 * [406] `NotAcceptableError`: Not Acceptable
 * [407] `ProxyAuthenticationRequiredError`: Proxy Authentication Required
 * [408] `RequestTimeOutError`: Request Time-out
 * [409] `ConflictError`: Conflict
 * [410] `GoneError`: Gone
 * [411] `LengthRequiredError`: Length Required
 * [412] `PreconditionFailedError`: Precondition Failed
 * [413] `RequestEntityTooLargeError`: Request Entity Too Large
 * [414] `RequestURITooLargeError`: Request-URI Too Large
 * [415] `UnsupportedMediaTypeError`: Unsupported Media Type
 * [416] `RequestedRangeNotSatisfiableError`: Requested Range Not Satisfiable
 * [417] `ExpectationFailedError`: Expectation Failed
 * [418] `IMATeapotError`: I'm a teapot
 * [422] `UnprocessableEntityError`: Unprocessable Entity
 * [423] `LockedError`: Locked
 * [424] `FailedDependencyError`: Failed Dependency
 * [425] `UnorderedCollectionError`: Unordered Collection
 * [426] `UpgradeRequiredError`: Upgrade Required
 * [428] `PreconditionRequiredError`: Precondition Required
 * [429] `TooManyRequestsError`: Too Many Requests
 * [431] `RequestHeaderFieldsTooLargeError`: Request Header Fields Too Large
 * [500] `InternalServerErrorError`: Internal Server Error
 * [501] `NotImplementedError`: Not Implemented
 * [502] `BadGatewayError`: Bad Gateway
 * [503] `ServiceUnavailableError`: Service Unavailable
 * [504] `GatewayTimeOutError`: Gateway Time-out
 * [505] `HTTPVersionNotSupportedError`: HTTP Version not supported
 * [506] `VariantAlsoNegotiatesError`: Variant Also Negotiates
 * [507] `InsufficientStorageError`: Insufficient Storage
 * [509] `BandwidthLimitExceededError`: Bandwidth Limit Exceeded
 * [510] `NotExtendedError`: Not Extended
 * [511] `NetworkAuthenticationRequiredError`: Network Authentication Required
