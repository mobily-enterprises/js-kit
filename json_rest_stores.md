JSON REST STORES

# Stores

Stores are objects that can store values, retrieve values, and retrieve collection of values based on a query.
There are effectively two types of stores:
 * Local stores (often memory)
 * Remote stores (often REST-based)
Local stores obviously have access to all of the local data, whereas remote stores don't. The implications of this are far-fetching and need to be deal with --especially when you make a store "observable" (that is, you want query results to be notified of changes). 

# Anatomy of a store

A store in simple term is an object with the following methods:

* `store.get( id )` -- fetch the item with id `id`
* `store.put( object, options )` -- store the object, which will have a unique id
* `store.remove( id  )` -- remove the item with id `id`
* `store.query( conditions, options )` -- return a collection of items satisfying `conditions`
* `store.getIdentity( )` -- returns the property acting as "id"

A store also has the following properties:

* `store.idProperty` -- the property treated as "id", for `get()` and `put()` operations

## The memory store

A memory-based story is a simple implementation of these methods manipulating a hash. The slightly complex part is in the querying, where items need to be returned based on the conditions set in `conditions`.

## The REST store

A REST store is initialised specifying a target, for example `var s = new JsonRest( { target: 'http://exmaple.com/users'} )`. Whenever an operation is executed, a network request is executed to complete that operation. For example, `get` will trigger an HTTP GET request, and so on.


# Caching stores

A common scenario while using stores is using a memory store as the cache of a REST store. The can be done by creating a "super-object" that implements all of the methods mentioned above, but then:

* `store.put()` will run the `put()` call on the main store, and then -- if successful -- will also write it onto the cache store
* `store.get( id )` will check if `id` is already present in the cache store -- if so, the main store won't be queried, and the cached result will be returned instead
* `store.query()` will always query the main store, but then each item will then be saved onto the cache.

The `store.query()` method may also be used to query cached stores if your application can make reliable assumptions that the remote data hasn't changed.

# Observing local stores

Observing stores should read as "Observing queries". When a store is observable, it has its `query()` method overridden, so that:

* Aa `notify( object, existingId )` method is added to the store. This method is used to notify a store that an element has changed.
* The original query is overridden, so that a an `observe( object, existingId )` method is added to the resultset. Note that "_to the resultset_". This means that `observe()` will ideally be called whenever an item is changed, _and that change affects that specific resultset_. To clarify: is you run `results = query( { active: true } )`, and then you decide to run `results.observe( function action(){ ... }` (which means `action()` will be called when the resultset is affected), and then call `notify( { name: 'Tony', active: false, id: 10 }, 10 ), the observing `action()` function should _not_ be called, since the change doesn't affect that specific changeset.
 * `put()`, `remove()`, which are methods that change the store's contents, are overloaded so that `notify()` is called once the operations are successful.


So, assume that you run 

    results = query( { active: true } )
    results.observe( function listener1(){ ... }
    results.observe( function listener2(){ ... }

At this point you have a query and two listeners, `listener1()` and `listener2()`, which are to be triggered when `results` is affected.
If you run:

    store.put( { name: 'Tony', active: false, id: 10 })
    -> (called by `store.put()`) store.notify( { name: 'Tony', active: false, id: 10 })` 

This will run the store's internal `queryUpdater()` for that particular resultset will run, and will check if the `put()` affects this resultset. Since the resultset filters any record that is marked as `active`, and the record added is `{ active: false }`, nothing will happen.
However, if you run:

    store.put( { name: 'Chiara', active: false, id: 10 })
    -> (called by `store.put()`) store.notify( { name: 'Chiara', active: true, id: 11 })` 

Then the store's internal `queryUpdater()` for that particular resultset will run, and will find that the result is _indeed_ in there. At this point, both `listener1()` and `listener2()` will be called.

The `queryUpdater()` needs to be smart enough to tell `listener1()` and `listener2()` what happened. The signature for the listeners is this:

    listener(object, removedFrom, insertedInto);

In this case, it might call something like:

    listener1( { name: 'Chiara', active: true, id: 11 }, null, 5)

That `5` at the end is the spot where the item will be added. This is when, magically, the item appears in your web interface.

You can clearly see that the `queryUpdater()` absolutely must have access to the _full_ store data to figure out where an item will be placed. For example, if the query includes `sort()`ing options, and an item that satisfies the filters is added to the store via `put()`, the `queryUpdater()` will need to call the listeners specifying the exact spot in the query where the item will be. This can only possibly happen with full access to the data -- and, full access to the store's functions to filter and search this data.

With remote stores, you don't have this luxury.

# Observing remote stores

Observing remote stores is a completely different story -- and a much harder one to grok. There are two sides to this story:

* You need to be notified that the store has actually changed. Problem: you cannot just overload `put()`, because changes are happening outside your application. The server needs to do the hard work.
* You need to check if a resultset is affected. Problem: you do NOT have access to your dataset

## Getting notifications

By reading this document, it's clear that all you need to do is tell your stores that an item has changed by using the `notify()` method. So, the solution to this issue is seemingly simple: you just have make sure the server communicates to the client, via polling or via pushing (comet, etc), making sure that the server tells the client the important parts (what changed, and how it changed) so that the client can run the proper `notify()` call on its stores.

## Network considerations on messages

It seems simple, until you land this to a real use-case. Imagine you have a system with 100,000 users, and about 5000 of them are logged in at the same time. Each open tab from each user will be "registered" on the server, and will receive messages (via push or pull, it doesn't really matter) about store contents that changes. Ideally if a user updates their profile picture, other users will instantaneously get the new picture displayed (web 2.0 at its best!). However, you can see how this will quickly become a problem -- a network load problem.
Basically, you will need to make sure you don't flood your network with messages. A possible way to fix this problem is by creating sub-federations of "workspaces" (which are the stem for multi-homing environment).
So, when a browser tab registers itself, it's always associated with a user. Each record can have a userId and a workspaceId, and each user can belong to several workspaces.
There are different cases when a record is updated:

* There is no workspaceId nor userId fields. In this case, the change will be broadcast to all tabs.

* There is a workspaceId (userId might be there or not). In this case, the change will be broadcast to all  tabs owned by users who belong to that specific workspaceId

* There is only a userId, no workspaceId. In this case, the change will get broadcast to all tabs owned by users who are in any one of the workspaceIds the userId also belongs to. This is the most expensive case: for example, if Tony Mobily changes his profile picture, he is potentially being displayed by users in any one of the workspaces he belongs to. So, all users who share at least one workspace will receive the notification.

Even though it's still a potentially expensive operation, it's still much better than broadcasting every single change to every single user.

Note that I haven't even considered possible ramifications in terms of access control (for example, there might be a contact marked as "private", for which only selected users should be notified).

This is to say that server-side notifications are easy in theory, but hard beasts in practice.

## Checking REST resultsets

Checking resultsets for REST stores is really complex. After a `store.notify()`, the `queryUpdater()` function (which is run over the resultset) needs to work out if the resultset has changed, and -- more importantly -- where the new record will be placed.
If it's a `put( { ... }, { before: 14 } )`, the server will theoretically place the item before the record with id `14` (for example, if you just moved an element using drag&drop). This can only be done in cases where the `queryUpdater()` has not only full access to the data, but also access to the very functions that are used to query the existing data. This is simply not possible with REST stores.
On the other hand, issuing a `refresh()` (that is, re-running the query) after each operation is both an overkill (it loads the server unnecessarily) and is visually ugly.
Here is a breakdown of the possible calls:

* `store.remove()`. This is the easy case: if an item is removed, then it will need to disappear from the resultset. This is always true. So, the `queryUpdater()` will look for that item in the resultset, and -- if found -- will call the listener like so: `listener( object, position , null )`, where `position` is where the item was in the resultset. Easy.

* `store.put()` This is not as easy nor straightforward as a `remove()`: does the new item satisfy the search conditions dictated by the query options? What about the sorting options? Where should the item be placed? These are all questions that could possibly be answered if you had access to the store's data and the filtering/sorting functions. Unfortunately, with REST stores you don't have access to either one of them.

So, `put()` is the tough one to consider. 

Assume for a second that you have an observable, REST store that uses the memory store for caching. This is the most common situation. Also, imagine that you are getting server messages so that you are running the right `notify()` for your stores -- when a message arrives, you make sure that you update the stores' cache and then issue tie right `notify()`. So, basically, you have an updated copy of your store's data in your store's cache.

In that case, you _could_ (in theory) use the cache store to find out where an item would belong after a query. Why "in theory"? Because in practice this often fails. Or, it only works when the sorting and filtering functions used on the client are completely equivalent to the ones used on the server. What about:

* Uppercase/lowercase issues (MongoDb's searches and sorting are case-sensitive, MySQL are case-insensitive)
* Specific filters (when filtering with `?name=tony` in the URL, the server might return records where the field `name` _contains_ `tony`, and so on)
* Custom filters. You could specify a search field, server-side, called `everywhere` so that passing `?anywhere=something` will search for `something` in a bunch of different fields. This might be the case in an application where you have the contacts view, and want to be able to filter data just by typing in a textbox.

And, all this is assuming that your application uses messages correctly, making sure that the store's cache is fully in sync with the server's. If your application doesn't use server messages/Comet, you would be applying the Memory store's sort and filtering functions on _partial_ data. Recipe for disaster.

You _can_ decide to write a memory store that suits your DB server, and mimics all of the server's searching abilities. However, this would be potentially a monumental amount of work. 

So:

* When using a REST store, you don't have access to all of the data, so the `queryUpdater()` cannot reliably work
* Even if you sync your data with pulled messages or Comet, you would need to make sure that the local store has the exact same filtering functions as the server's.

### A possible solution about checking REST resultsets

There needs to be a solution to the "REST" problem -- something that goes beyond the "implement the same filtering and sorting functions on the client", especially since you don't want to change the client implementation if you change, for example, database server; and you don't want to implement complex search functions based on arrays for more evolved search functions (if that's even possible).

How can `queryUpdater()` know what to do? The answer is, "it doesn't, it can't, it won't, it shouldn't, it mustn't". It all seems negative, but it's not so bad.
Consider that:

* If there is no `sort`, the field will be organically ordered.
* If there is no `query`, `start`, `count` defined, it means that there is actually no filtering happening.

So, if none of `sort`, `query`, `start`, `count` are defined, then `queryUpdater` can assume that:

* All records are in the result set and are displayed in organic order
* If `put()`ting one, it can safely either go according to its placement ('before'), or at a position specified in the query (`placeNew` set to `first` or `last`);

Even when there is a sort, there are many cases when you know you want to place a record either at the top or at the bottom. Imagine for example a store that holds a list if comments: adding a comment using a REST store will trigger the server to assign a timestamp to the record; so, you know where the record will be placed -- you just need to let `queryUpdater` know.

Basically, for new elements:
 * IF the `put()` method specifies `before`, follow it.
 * ELSE IF the query has `placeNew` set to either `first` or `last`, follow it
 * ELSE IF the query doesn't have `sort`, `query`, `start`, `count`, add at the end
 * ELSE don't notify. The store will need to refresh

 For existing elements:
 * IF the `put()` method specifies `before`, follow it.
 * ELSE If the query doesn't have `sort`, `query`, `start`, `count`, overwrite existing field
 * ELSE don't notify. The store will need to refresh.

# Creating stores client side, or "interpreting notifications"

There is another potential issue to consider: creating objects representing stores.
On the server side, you are likely to have one store object per store, each one responding to a specific URL. 

Take for example: `/workspaces/:workspaceId/users/:userId/categories`. On the server side, you would have:

* GET `/workspaces/:workspaceId/users/:userId/categories/` -> `query( {} )`) -- to return an array of categories, aft
* DELETE `/workspaces/:workspaceId/users/:userId/categories/:id` ->  `remove( :id)` -- to remove an element
* PUT `/workspaces/:workspaceId/users/:userId/categories/:id` ->  `put( object )` -- (where `object` has an id) to overwrite or create an element
* POST `/workspaces/:workspaceId/users/:userId/categories/` ->  `put( object )` -- (where `object` does NOT have an id) to add a new element

The server knows that requests will come for those URLs, and respond accordingly.

The client side is a little more complicated than that. In your application, you will need to create a different store for each URL (the constructor for the store object includes a `target` for a reason: the store needs to know what URL it should use to contact the server).

If you have two widgets displaying data from the same source, you might end up with two different stores. For example, `var categories1 = new ObservableRestCachedStore( { target: '/workspaces/11/users/12/categories/`})` to display categories belonging to user `12`, and `var categories2 = new ObservableRestCachedStore( { target: '/workspaces/11/users/24/categories/`}) to display categories belonging to user `24`.

When a server issues a change in the record `{ store: 'categories', record: { id: 100, workspaceId: 11, userId: 12, categoryName: 'New name' }` for the store `categories`, it needs to:

1 Find all of the stores instances of `categories`. This is achievable if you have a list of stores in your application saved up by store name.
2 Find all stores where the URL parameters actually match. This is something easily oversighted -- and crucial. For example, in this specific case it wouldn't make sense to issue a notify for `categories2`, because it refers to the dataset matching `workspaceId -> 11` and `userId -> 24`, whereas the notification was for a category belonging to `userId -> 12`.

The second point is the crucual one: assuming that the URL will apply id-field filtering (which is the only sane way I can think of), if you don't apply the second step, the store `category2` will get polluted with data that doesn't belong to it, and never will.

Basically, receiving notification from the server via messages (using pull, Comet, etc.) is only a beginning. The client needs to be smart about the stores it actually notifies, to avoid polluting stores.

## The "double name" issue

There is more to this problem, which makes it even more interesting. While developing your application, at some point you will need stores which refer to the same database table on the server. A practical example of this is the table `workspacesUsers`, which is a list of users "connected" to a database. It's a simple "link" table, with only two fields: `{ workspaceId: id, userId: id }`.
You have your stores, created as `workspacesUsers1 = new ObservableRestCachedStore( { target: '/workspaces/:workspaceId/users/'})` which is all fine. One day, you discover that you also want to list the workspaces a user is linked to. So, you want to do `usersWorkspaces1 = new ObservableRestCachedStore( { target: '/users/:userId/workspaces/'})`. The problem you have at this point is that on the server you have two different stores, but they are referring to the same database table. If one changes, the other one changes too.
You have two options:

* You make sure the server knows which stores are "siblings", and issues _two_ messages when data changes. This is the "simple" approach, with two problems: 1) More network traffic 2) More importantly, the client will only ever know that a sibling store has changed from a server message 3) The server needs to be programmed so that while it doesn't broadcast a change to the same user who has originated it, it will need to do so in case the message is for a sibling store.

* You make sure the client knows which stores are "siblings". This means that when there is a message for `usersWorkspaces`, the client will need to update the cache, and run the `notify()`, for both stores.









