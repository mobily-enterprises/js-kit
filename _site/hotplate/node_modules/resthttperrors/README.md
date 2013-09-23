HTTPErrors
==========

This is a simple bunch of HTTP errors, which include handy properties to know what they are and what their status code should be.

## BadRequestError (400)

This error is triggered when the URL has a problem. In web applications, this is often triggered when the ID of a resource in an URL is not in the right format. This is why its constructor has errorFields, as well as the message:

    e['BadRequestError'] = function( message, errorFields ){
      this.httpError = 400;
      this.message = message || 'Bad request';
      this.name = 'BadRequestError';
      this.errorFields = errorFields;
    }
    util.inherits(e['BadRequestError'], Error);

## UnauthorizedError (401)

This error is used when a user needs to login in order to access a resource. Nothing fancy here:

    e['UnauthorizedError'] = function( message ){
      this.httpError = 401;
      this.message = message || 'Login necessary to access the requested resource';
      this.name = 'UnauthorizedError';
    }
util.inherits(e['UnauthorizedError'], Error);

## ForbiddenError (403)

This error is used when even though a user may be logged in, they might not have the right permissions to access a specific resource. Nothing fancy here:

    e['ForbiddenError'] = function( message ){
      this.httpError = 403;
      this.message = message || 'Access to resource denied';
      this.name = 'ForbiddenError';
    }
util.inherits(e['ForbiddenError'], Error);

## NotFoundError (404)

We all know this one. One of the few errors for which even non-developers know its code...

e['NotFoundError'] = function( message ){
  this.httpError = 404;
  this.message = message || 'Resource not found';
  this.name = 'NotFoundError';
}
util.inherits(e['NotFoundError'], Error);
 

## PreconditionFailedError (404)

This error is triggered when a precondition is not met. For example, the user has sent the header `if-match: *` and has requested a PUT on a resource that doesn't exist. Nothing fancy:

    e['PreconditionFailedError'] = function( message ){
      this.httpError = 412;
      this.message = message || 'Precondition failed';
      this.name = 'PreconditionFailedError';
    }
    util.inherits(e['PreconditionFailedError'], Error);

## ValidationError (422)

A very common error. It happens when a field in an online form has a field that doesn't pass validation. The constructor has the message, as well as a second field `errorFields` which is an object in the format `{ field: "Error message", anotherField: "Another error message" }`. The server, when this error happens, is meant to send something back to the client probably highlighting the affected fields with the message

    e['ValidationError'] = function( message, errorFields ){
      this.httpError = 422;
      this.message = message || 'Validation problem';
      this.name = 'ValidationError';
      this.errorFields = errorFields;
    }
    util.inherits(e['ValidationError'], Error);

## NotImplementedError (501)

An error when a client asks to PUT when they shouldn't be. Nothing fancy here.

    e['NotImplementedError'] = function( message ){
      this.httpError = 501;
      this.message = message || "Method not implemented";
      this.name = 'NotImplementedError';
    }
    util.inherits(e['NotImplementedError'], Error);


## RuntimeError (503)

Another error often known to lay people. When an application bombs, this is what should be triggered. The database server connection might have failed, or a database lookup that _ought to_ have worked failed. The "trick" is to 1) Create a new RuntimeError 2) Create the RuntimeError passing it a not-so-scary message and the `originalError` to it 3) Give the user a not-so-scary message 4) Log the original error in the application, so that you can see what _actually_ happened. Here's the code:

    e['RuntimeError'] = function( message, originalError ){
      this.httpError = 503;
      this.message = message || "Runtime error";
      this.name = 'RuntimeError';
      this.originalError = originalError;
    }
    util.inherits(e['RuntimeError'], Error);


