# INTEGRATE SOME OF THIS IN THE EXISTING DOC (clientsEventsManagement.md)

# Authentication and user information in Hotplate Universal Starter Kit

Authentication is tricky business, as it involves the storage within the app of user data once authenticated, as well as communication with the user if anything goes wrong.

**Authentication**. HUSK covers pretty much every angle of user authentication, including: login using Facebook or login/password pair; registration using Facebook or login/password pair; login recovery; linking existing account to Facebook or login/password pair; re-login within the app using one of the linked methods if the session is lost mir-air; lock-out prevention; password change; username change; config data at load time; and so on.

**User data**. Something tightly connected to authentication is user data. When the user object is returned at login time, the server app will return extra configuration objects. In HUSK, there are two configuration objects: one is the full config, which is only available when the user is actually logged in; and one called "generic" which applies when the user "was" logged in, but she no longer is. More of this later.

**User messages**. Something else that is not quite as tightly connected is user messages: authentication will generate messages to the user, which can be about success, informational, or error. HUSK has a centralised way of dealing with the delivery of user messages: a widget can emit an event (named `user-message-success`, `user-message-info` or `user-message-error`) knowing that a widget "up there" will display it.

HUSK tries to keep things as simple as possible; these three moving parts are isolated as much as possible; however, they do work together and need to be understood. This document explains how authentication works in HUSK.

## The center of gravity: the event `auth-event`

Authentication can happen via oAuth or via login/password. This implies that an authorisation event can happen "outside" the application (for example a Facebook login screen that goes through successfully).

This is why the entire authentication protocol is based on DOM events. Specifically, _one_ DOM event of type `auth-event`, which must target `window.document.body`. This is the starting point: any authentication event (failed or successful) must generate this event.

The event's detail is an object with the following fields:

- `strategyId` -- currently it can be `local`, `facebook` or `who`
- `action` -- it can be `signin`, `register`, `manager`. These are actions compatible with hotplate's `hotCoreAuth` module.
- `user` -- the user object. It can be:
  - `falsy`. Authentication failed
  - `object`. It's an object with the properties `config` and `generic`. More about this later.
- `info` -- additional info:
  - If `user` is falsy, it will be an object with _optional_ properties `message` and `code`
  - If `user` is truly, it will be an object with _optional_ additional information about the user
- `originalEvent` -- if present, the event that originally triggered the generation of `auth-event`.

It's crucial to remember that `auth-event` events can be generated from the application itself, or from `outside` the application (for example a child window that has opened to carry on facebook authentication, and that will eventally emit a `auth-event` event on `window.opener.document.body`).

The definite list of files that generate the `auth-event` event can be seen by searching for `this.fire( 'auth-event'`. Here it is:

### `my-main.html`

When the application is fired up, the very first thing it does is call `/stores/session/who` which will tell the application information about the user. Specifically, an onject with the fields:

- `loggedIn` -- A boolean value that will tell the application if the user is logged in or not.
- `config` -- If the user is logged in, it will contain the full configuration object for the user
- `generic` -- If the user has a session but she's no longer logged in. This happens when the user logs out (that is, calls `/stores/session/logout`) but hasn't clicked on "Not me" (that is, hasn't called `/stores/session/notme`).

_Note: the `who` store is not part of Hotplate itself. It's a helper store for HUSK_

As you can see, the `config` and `generic` fields are the ones that make up the `user` object. So, if the user is already logged in, `my-main.html` will fire:

  this.fire( 'auth-event', { strategyId: 'who', action: 'signin', user: request.response,  info: {} }, { node: window.document.body } );

If the user is not already logged in, `my-main.html` will fire:

  this.fire( 'auth-event', { strategyId: 'who', action: 'signin', user: false, info: {} }, { node: window.document.body } );

### `my-login-any`

### Login using login/password pair

Once login is attempted, by calling `/app/auth/signin/local/postcheck`, the server will return either `401` (Unauthorized) or `200` (OK). In both cases, it will return an object with the following fields:

* `strategyId`. In this case, `local`.
* `action`. In this case, `signin`
* `user`.
  * If authentication was successful, the user object, containing the usual `config` and `genetic` properties
  * If authentication failed, `false`
* `info`.
  * If authentication was successful, an empty object
  * If authentication failed, an object with (optional) properties `message` and `code`. Code can be: `ALREADY_LOGGED_IN`, `LOGIN_FAILED`.

Note that this server call is completely compatible with what `auth-event` expects. This is why `my-login-any` can simply do this:

    var request = e.detail.error ? e.detail.request : e.detail;
    this.fire( 'auth-event', { strategyId: 'local', action: 'signin', user: request.response.user,  info: request.response.info }, { node: window.document.body } );

This code is taken from the function `signinResponse`, which is run for _both_ success and error:

    `<form is="iron-form" method="POST" on-iron-form-response="_signinResponse" on-iron-form-error="_signinResponse" action="/app/auth/signin/local/postcheck">`

`<iron-ajax>` will create different types of `detail` objects depending on whether the call was a success or not; that's why the first line, `var request = e.detail.error ? e.detail.request : e.detail;`, is needed.

### Login using Facebook

Once the user has clicked on the "Login with Facebook" icon, a new window will be opened which will allow the user to login using Facebook. The callback URL will be displayed by the newly opened window (obviously). So, how does the "main" app's window (containing the login screen) know anything about login? The answer is simple: the newly opened window will emit a `auth-event` event on `window.opener.document.body`, where `e.detail` is set as explained above.

This means that as far as the application is concerned, there is no difference between logging in with user/password pair or Facebook: the end result is the same

### `my-local-link.html`, `my-local-set-password.html`, `my-local-unlink-set-user.html`, `my-login-me.html`, `my-register.html`

The exact same concepts apply for the files above: all of them fire an `auth-event` event in the exact same fashion.

## User data storage

Many parts of the application need to know whether the user is logged in or not, and the basic user configuration (which may include permissions, name, etc.). User information is stored in `userData` within HUSK.

The first file that is loaded is `my-main.html`, which will run `/stores/session/who` immediately, firing the `auth-event` event (as explained above). `my-main.html` contains a very important element:

     <my-auth-events-relay user-data="{{userData}}"></my-auth-events-relay>

This element is the "glue" for `auth-event` events, `userData` and UI messages to the user. It is explained later in the document. For now, keep in mind that `my-auth-events-relay` is the _only_ module that will directly change `userData`. Since `userData` is _always_ changed as a consequence of an authorisation event, no other file must ever change it (with the exception of `my-logout.html`, which obviously needs to log the user out by resetting it).

The `my-main.html` has two-way binding of `user-data` with `my-auth-events-relay.html`, as well as with `my-app.html`. This means that `my-app.html` will always be aware of the user status (logged in or not) and her current configuration.

The `userData` object has the following properties:

- `loggedIn`
- `config`
- `generic`

Which is clearly the _exact_ information returned by `/stores/session/who`. Every part of the application that needs to know about the user (specifically, if they are logged in) will simply be bound to `userData`.

## UI user messages

The last piece of the puzzle is in the way UI user messages are delivered to the user. In HUSH, a module that wants to display a user message will simply call:

    this.fire('user-message-success', {
      message: "Password changed!"
    });

The event types are `user-message-success`, `user-message-info` and `user-message-error`. They will be displayed in different ways (for example error messages are likely to be red).

In HUSK, the module that is responsible for displaying those messages is `hot-user-message-toasts`, whick will user `paper-toast` elements to display the messages. However, it's entirely possible to change which module listens to messages (and, for example, write one that will display messages differently depending on the size of the device).

HUSK actually overload the message's detail with an extra property: `originalEvent`. This is not part of the `user-message-*` protocol, but it is used by HUSK. More about this later.

Note that it's crucially important that whichever element is responsible to deliver messages to the user is a "container" of the application, so that user messages do bubble up. In HUSK, `<hot-user-message-toasts` contains `<my-main>` itself:

    <hot-user-message-toasts>
      <my-main></my-main>
    </hot-user-message-toasts>


## Connecting all of the dots: the `my-auth-events-relay` element

The glue that keeps everything together is `my-auth-events-relay.html`. It's the very first thing included in `my-main.html`:

    <my-auth-events-relay user-data="{{userData}}"></my-auth-events-relay>

This module does the following:

* Listens to `auth-event` events
* If a successful `auth-event` is received (that is, `detail.user` is truely and therefore an object), it sets `userData`'s properties `config` and `generic` to `detail.user.config` and `detail.user.genetic` respectively.
* It delivers user messages:
  * If a successful `auth-event` is received, it will fire up `user-message-success` with the appropriate message depending on the `action` and the `strategy` properties of the `auth-event` event.
  * If a, unsuccessful `auth-event` is received, it will fire up `user-message-error` with the message in `info.message`
  * In any case, it will fire up `user-message-success` or `user-message-error` with (optional) `originalEvent` set.

The `my-auth-events-relay.html` file is basically responsible of 1) Making sure that `userData` is successfully set upon authentication 2) Communicating to the user authentication messags.

## Recovering session mid-air

One of the cases HUSK covers is when the application is theoretically logged in, but the server doesn't quite agree with that theory. As a result, some calls will return 401 (Unauthorized) and will fail.

If that is the case, a good web application must ask the user for their credentials, and -- once they are successfully received -- the user should be able to interact with the application again.

Achieving this can be complicated, because:

* `iron-ajax` events don't bubble, [although they might in the future]( https://github.com/PolymerElements/iron-ajax/issues/156)
*  `iron-ajax` cannot be extended to generate a bubbling event in case a 401 is received, as Polymer inheritance is still not there, [although it might be there in the future](https://github.com/Polymer/polymer/issues/2280).

Since with HUSK a problem like 401 (Unauthorized) is basically always referred to the user, at least for now the capture of those events happens in the  UI user messages realm. This means that in order for the application to ask for a re-login in case on 401 (Unauthorized) messages:

* The application needs to emit a user message (which is always the case)
* The `user-message-error` event must include, in its detail, an `originalEvent` property

The main form used in HUSK, `<hot-form>`, already does it. This covers most of the cases. `<my-auth-events-relay>` also does it (thanks to the fact that `auth-event` events do pass it). So, basically, in terms of development most of the work is already done. The only thing that needs to be remembered is that every time a `user-message-error` event is fired, it must be enriched with `originalEvent`. This property will be ignored by the element displaying the message, but will be captured by the `<my-relogin-dialog>`  element, included in `my-app.html`:

    <!-- This is the dialog that will appear if the user needs to re-login -->
    <my-relogin-dialog user-data="{{userData}}"></my-relogin-dialog>

Developers will just need to remember that any errors from Ajax calls will need to be displayed (which is a given), and that when doing so they must include `originalError` in firing `user-message-error`.

## Changing path on login and logout

In HUSK, there is one last detail: once logged in, the user needs to be redirected to the application's home. Otherwise, users will be staring at the login page.

Similarly, since logout is a simple button, the user needs to be redirected to the application's home. Otherwise, whichever page they were in will possibly fire 501 (Unothorized).

For changing route when logging in, `my-app.html` will listen to the `auth-event` event just with the purpose of changing route once login happens:

    authEventReceived: function(e){
      // The authentication went through.
      if( e.detail.user && e.detail.action == 'signin' && this.page == 'login' ){
        this.set( 'routeData.page', "home" );
      }
    },

For changing route when logging out, `my-logout.html` will do it -- which is why it has a two-way binding with routing data:

    <my-logout id="logoutButton" user-data="{{userData}}" route-data="{{routeData}}"></my-logout>

Incidentally, `<my-logout>` is also the only widget that will touch directly `userData`.

## That's it

This document covers most (if not all) of the trickiest aspects of HUSK. Arguably, HUSK is a showcase of the `hot-` elements, and an empty application that is actually fully featured in terms of user credential and information management.

There are a few moving parts, but they are well isolated and they all make sense.
