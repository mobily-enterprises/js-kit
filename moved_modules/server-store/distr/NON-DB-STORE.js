const JsonRestStores = require('jsonreststores')
const HttpMixin = require('jsonreststores/http')

// The store needs
const vars = require('../../vars')

class Store extends HttpMixin(JsonRestStores) {
  //
  // The next 3 fields will define the stores' URL, in this case
  // it will be `/stores/2.0.0/storeTemplate/:id`.
  static get publicURLprefix () { return '<%=userInput["server-stores"].publicURLprefix%>' }
  static get version () { return '<%=vars.newStoreInfo.version%>' }
  static get publicURL () { return '<%=vars.newStoreInfo.publicURL%>/:id' }

  // This is a unique name for the store. It should match the store name in the URL
  static get storeName () { return '<%=vars.newStoreInfo.name%>' }

  // This is the list of the supported methods.
  // The difference between POST and PUT is that
  // PUT will expect an ID
  static get handleGet () { return <%=vars.newStoreInfo.methods.indexOf('get') !== -1 ? 'true' : 'false'%> }
  static get handleGetQuery () { return <%=vars.newStoreInfo.methods.indexOf('getQuery')  !== -1 ? 'true' : 'false'%> }
  static get handlePost () { return <%=vars.newStoreInfo.methods.indexOf('post')  !== -1 ? 'true' : 'false'%> }
  static get handlePut () { return <%=vars.newStoreInfo.methods.indexOf('put')  !== -1 ? 'true' : 'false'%> }
  static get handleDelete () { return <%=vars.newStoreInfo.methods.indexOf('delete') !== -1 ? 'true' : 'false'%> }

  // An artificial delay can be specified for testing purposes
  static get artificialDelay () { return vars.artificialDelay }

  // Only non-http errors will be chained to the next middleware.
  // Everything else (HTTP errors) will be handled by the store
  static get chainErrors () { return 'nonhttp' }

  // Methods that MUST be implemented for the store to be functional
  // They need to satisfy the JsonRestStores DB API

<%if(vars.newStoreInfo.implementation === 'errors') { -%>
  // Input: request.params (with key request.params.id GUARANTEED to be set)
  // Output: an object
  async implementFetch (request) {
    throw (new Error('implementFetch not implemented, store is not functional'))
  }

  // Input:
  // - request.body
  // Output: an object (the saved record)
  // This could be the result of a PUT /store/1 or POST /store
  async implementInsert (request) {
    throw (new Error('implementInsert not implemented, store is not functional'))
  }

  // Input:
  // - request.params (query string)
  // - request.body (data)
  // Output: an object (updated record, normally refetched)
  async implementUpdate (request) {
    throw (new Error('implementUpdate not implemented, store is not functional'))
  }

  // Input: request.params (with key request.params.id GUARANTEED to be set)
  // Output: nothing
  async implementDelete (request) {
    throw (new Error('implementDelete not implemented, store is not functional'))
  }

  // Input: request.params, request.options.[conditionsHash,skip,limit,sort]
  // Output: { data: [], grandTotal: n }
  async implementQuery (request) {
    throw (new Error('implementQuery not implemented, store is not functional'))
  }
<%} else { -%>
  // Input: request.params (with key request.params.id GUARANTEED to be set)
  // Output: an object
  async implementFetch (request) {
    return { id: request.params.id }
  }

  // Input:
  // - request.body
  // Output: an object (the saved record)
  // This could be the result of a PUT /store/1 or POST /store
  async implementInsert (request) {
    return { id: request.params.id }
  }

  // Input:
  // - request.params (query string)
  // - request.body (data)
  // Output: an object (updated record, normally refetched)
  async implementUpdate (request) {
    return { id: request.params.id }
  }

  // Input: request.params (with key request.params.id GUARANTEED to be set)
  // Output: nothing
  async implementDelete (request) {
    return { id: request.params.id }
  }

  // Input: request.params, request.options.[conditionsHash,skip,limit,sort]
  // Output: { data: [], grandTotal: n }
  async implementQuery (request) {
    return [
      { id: request.params.id },
      { id: 100 },
      { id: 101 },
      { id: 102 },
      { id: 103 },
      { id: 103 }
    ]
  }
<% } -%>

}
exports = module.exports = new Store()
