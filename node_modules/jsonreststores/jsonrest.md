
Here is a summary of the methods that should be implemented by any JsonRest server, and how.
The reference implementation for the client is JsonRest by Dojo

# `PUT {target}/id`

## "STRAIGHT PUT"

**When in Dojo**:  

 * store.put(), with ID (object/options) and options.incremental is FALSE

**Goals**:  

 * Update a specific object
 * Create an object with a specific ID

**Options**:  

 * overwrite : Overwrite object (header: `If-Match: *`)
 * !overwrite: Do not overwrite object (header: `If-None-Match: *`)

**Return**  

 * New resources:
   * `201 Created` - on success, IF returning data
   * `201 Created OR 204 No Content` - on success, IF NOT returning data -- ???
 * Existing resource:
  * `200 Accepted` - on success, IF returning data
  * `200 Accepted OR 204 No Content` - on success, IF NOT returning data


# POST {target}/id

## "APPEND PUT"

**When in Dojo**:  

 * store.put(), with ID (object/options), and options.incremental is TRUE
   * The option `overwrite` here cannot mean much, as it's an append operation

**Goals**:  

 * "Append" to a specific object

**Notes**:  
 * There needs to be logic to handle the "append" operation -- the submitted data will "change"
    {target}/id adding information to it

**Return**:  

  * `200 Accepted` - on success, IF returning data
  * `204 No Content` - on success, IF NOT returning data

**Notes on return**:  
 * RFC read as broadly as possible, where it says:
> The action performed by the POST method might not result in a resource that can be identified by a URI. In this case, either 200 (OK) or 204(No Content) is the appropriate response status, depending on whether or not the response includes an entity that describes the result.


# `POST {target}`

## "STRAIGHT POST"

**When in Dojo**  

 * store.put(), no ID (object/options), and options.incremental is FALSE

**Goals:** 

 * Write over a resource with a specific ID (or create it if it doesn't yet exist)

**Notes:** 

 * The parameter `overwrite` here cannot mean much, as it's an append operation
 * The call should include, as a response header, something like "Location: http://www.example.com/users/4/"

**Return**:

 * `201 Created` - on success, IF returning data
 * `201 Created OR 204 No Content` - on success, IF NOT returning data -- ???
 

# `GET {target}/id`

## "STRAIGHT GET"

**When:**  
 * store.get(id)

**Goals:**  

 * Getch a specific resource

**Notes:**  

 * This is a 100% clean "get"

**Return:**  
  * `200 OK` -  with contents.
  * `204 No Content` - On success, if entity is 100% empty (this shouldn't happen in a JsonRest store)

# GET {target}

## "QUERY GET"

**When:**  

 * store.query(query, options)

**Goals:**  

 * Make a query on a collecton

**Notes:**  
 * This needs to return an array of objects
 * OPTION: WHEN options.start >= 0 || options.count >= 0
   * `Range` header might be specified by client: Range: items=0-24. Server should respond: Content-Range: items 0-24/66
 * OPTION: WHEN options.sort: [ {attribute: "one", descending: true }, { attribute: "two", descending: false} ]
   * `http://url/?sort(+one,-two)` IF sortParam wasn't defined when creating the store
   * `http://url/?sortParamValue=+one,-two` if sortParam was set as `sortParamValue` 

**Return:**  
  `200 OK` - If everything went well. Note: there should always be contents, even if it's just []


COMMON ERROR MESSAGES
---------------------
* `400 - Bad request` --  Maybe some of the IDs are malformed
* `401 - Unautorized` --  Need to login to see the URL
* `403 - Forbidden` -- You are logged in but cannot access this URL
* `404 - Not found` -- Have a wild guess
* `405 - Method not allowed` -- The method is not allowed on the resource
* `422 - Validation error` -- One of the values in the body didn't validate
* `406 - Method not acceptable` (same as 405)

**Rarely used:** 

* `409 - Conflict` -- POST and PUT didn't work because of a conflict in the database
* `501 - Not implemented` (same as 405)


