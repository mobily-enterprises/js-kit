hotplate
========

Hotplate is a framework that allows you to create 201X software in no time.
By 201X software I mean software that:

* allows you to log in using Facebook, Google, Twotter, Oauth1/2, or... well, login/password pair if you like
* available anywhere with a Javascript runtime (see: any modern browser)
* _feels like_ software, and not like a bunch of web pages
* uses a smart client, and a smart server; the smart client is to display information is the most user-friendly possibly way, whereas the smart server is to provide a bunch of secure data-store that are JSON-REST compatible
* handles errors (including, and in fact _especially_, network errors) properly. If anything really bad happens, the application must not stop -- and tell the user
* has the ability to communicate to your users in different ways: email, SMS, and whatever the world throws at us
* whos information **as it changes** to the user. If you have three tabs open, and change your user photo, from one tab, the other two tabs need to see the new photo as well

I realise that in 202X (that is, 2020 to 2030) writing software will be different. What is cool now, will be taken 100% for granted. Or maybe Javascript will be dead. I don't know, and I frankly don't care. I wrote Hotplate because I felt that this is what software _should_ be in 201X -- which is now.

## Status:

* Authentication: IN PROGRESS
* General code cleanup, and hotCoreMessags: UPCOMING
* Write a sample, small application: UPCOMING
* Writing the messenging framework: UPCOMING

# Basic concepts

Hotplate itself is essentially a module loader and a system to invoke (or emit) and listen to messages.
It's then up to you to use Hotpate to load Hotplate modules in your application.
Some of the modules are considered "core" -- they all start with `hotCoreXXX`. 


