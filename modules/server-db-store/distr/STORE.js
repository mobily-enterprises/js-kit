const JsonRestStores = require('jsonreststores')
const MysqlMixin = require('jsonreststores-mysql')
const HttpMixin = require('jsonreststores/http')
const Schema = require('simpleschema')

// The store needs a mysql connection to work. It's assumed that
// the connection is in vars.connection
const vars = require('../../vars')

class StoreTemplate extends MysqlMixin(HttpMixin(JsonRestStores)) {
  static get schema () {
    //
    // The schema. This schema has 3 example fields, one boolean and
    // two strings
    return new Schema({
      // field1: { type: 'boolean', default: false },
      // field2: { type: 'string', trim: 16, default: '' },
      // field3: { type: 'string', trim: 16, default: '' }
<%if(vars.newStoreInfo.positioning){ -%>
      position: { type: 'number', canBeNull: true } // Field for positioning
<% } -%>
    })
  }

  static get searchSchema () {
    return new Schema({
      // The search schema here matches the schema, but that doesn't have to
      // be the case.
      // Every field here will be allowed in the query string. For example
      // /stores/storeTemplate?search=something will be allowed.
      // Not all fields have to be here; also, not every entry here must be
      // a schema field -- for example `search` is not a schema field.
      // search: { type: 'string', trim: 16 },
      // field1: { type: 'boolean' },
      // field2: { type: 'string', trim: 16 },
      // field3: { type: 'string', trim: 16 }
    })
  }

  // Default sort (only used when no sorting is specified) and
  // sortable fields
  static get defaultSort () { return { } } // e.g. { surname: : -1 }
  static get sortableFields () { return [] } // e.g. ['surname', 'name']

  // Position and placement configuration
<%if(vars.newStoreInfo.positioning){ -%>
  // No positioning management. Set 'positionField' and add the field to the schema
  // -- e.g. position: { type: 'number', canBeNull: true } -- to enable it
<% } -%>
  static get positionField () { return '<%=vars.newStoreInfo.positioning ? "position" : ""%>' }
  static get positionFilter () { return [] }
  static get beforeIdField () { return 'beforeId' }

  // The next 3 fields will define the stores' URL, in this case
  // it will be `/stores/2.0.0/storeTemplate/:id`.
  static get publicURLprefix () { return '<%=userInput["server-stores"].publicURLprefix%>' }
  static get version () { return '<%=vars.newStoreInfo.version%>' }
  static get publicURL () { return '<%=vars.newStoreInfo.publicURL%>/:id' }

  // This is a unique name for the store. It should match the store name in the URL
  static get storeName () { return '<%=vars.newStoreInfo.name%>' }

  // Storing options
  static get emptyAsNull () { return false } // An empty value will be treated as NULL
  static get fullRecordOnUpdate () { return false } //  A write will only affects the passed fields, not the whole record
  static get fullRecordOnInsert () { return true } //  A write will only affects the passed fields, not the whole record

  // This is the list of the supported methods.
  // The difference between POST and PUT is that
  // PUT will expect an ID
  static get handleGet () { return true }
  static get handleGetQuery () { return true }
  static get handlePost () { return true }
  static get handlePut () { return true }
  static get handleDelete () { return true }

  // An artificial delay can be specified for testing purposes
  static get artificialDelay () { return vars.artificialDelay }

  // The MySql connection must be passed, as well as the MySql table
  static get connection () { return vars.connection }
  static get table () { return '<%=vars.newStoreInfo.table%>' }

  // Only non-http errors will be chained to the next middleware.
  // Everything else (HTTP errors) will be handled by the store
  static get chainErrors () { return 'nonhttp' }

  // This is an example permission
  async checkPermissions (request) {
    //
    // Uncomment this to test store without permissions
    //
    // Permissions might also be based on `request.method`, which can be
    // `put`, `post`, `get`, `getQuery`, `delete`.
    //
    // There is also an 'request.inMethod` function, which can be `implementUpdate`,
    // `implementInsert`, `implementQuery`, `implementFetch` and `implementDelete`.
    //
    // Note that when `request.method` is `put`, it might result in `request.inMethod`
    // being `implementInsert` (a new record) or `implementUpdate` (a new record)

    // Example:
    /*
    // No login, no joy
    if (!request.session.loggedIn) return { granted: false }

    // Admins can always do ANYTHING. This is an example.
    if (request.session.flags.isAdmin) return { granted: true }

    // All non-operators: nope
    return { granted: false }
    */
    return { granted: true }
  }

  // Manipulate request.body as needed, before validation happens, for
  // PUT and POST requests
  async beforeValidate (request, errors) {

    // This happens BEFORE valudation. The store can accept extra-schema
    // fields (as long as they are deleted, or validation will fail)
    // E.g.
    // if (request.body.weirdFieldNotInSchema === 10) request.body.someSchemaField = 11
    // delete request.body.weirdFieldNotInSchema
  }

  // ExistingErrors has the errors coming from checks earlier in the pipeline
  //
  // INPUT:
  // * request.body -- data sent by the client
  // * request.method
  // * request.record (existing data if request.inMethod === 'implementUpdate')
  // * { ...request.record, ...request.body } -- a "full" record made up of new and existing data
  async validate (request, errors) {

    // Example:
    // if (request.body.name === 'tony') errors.push({ field: 'name', message: 'Name already taken' })
  }

  /* ***********************************
    *  DB HOOKS FOR FIELDS, JOINS, ETC.
    ************************************
  */
  commonFields (request, op) { // `op` is 'query' or 'fetch'
    return this.schemaFields()
  }

  commonJoins (request, op) { // `op` is 'query' or 'fetch
    return []
  }

  fetchFieldsAndJoins (request) {
    return {
      fields: this.commonFields(request, 'fetch'),
      joins: this.commonJoins(request, 'fetch')
    }
  }

  fetchConditionsAndArgs (request) {
    return { conditions: [], args: [] }
  }

  queryFieldsAndJoins (request) {
    return {
      fields: this.commonFields(request, 'query'),
      joins: this.commonJoins(request, 'query')
    }
  }

  queryConditionsAndArgs (request) {
    return this.optionsQueryConditionsAndArgs(request)
  }

  querySort (request) {
    return this.optionsSort(request)
  }

  manipulateUpdateObject (request, updateObject) {
    return updateObject
  }

  updateJoins (request) {
    return []
  }

  updateConditionsAndArgs (request) {
    return { conditions: [], args: [] }
  }

  // It may change request.record (which will be returned) depending on
  // after-update changes
  async afterUpdate (request) {
  }

  manipulateInsertObject (request, insertObject) {
    return insertObject
  }

  // It may change request.record (which will be returned) depending on
  // after-insert changes
  async afterInsert (request) {
  }

  deleteConditionsAndArgs (request) {
    return { conditions: [], args: [] }
  }

  deleteTablesAndJoins (request) {
    return {
      tables: [this.table],
      joins: []
    }
  }

  async transformResult (request, op, data) {
    const record = data

    // Example:
    /*
    switch (op) {
      case 'fetch':
        record.fetched = true
        return record
      case 'query':
        data = data.map(record => {
          record.fetched = true
          return record
        })
    }
    */
    return record
  }
}

exports = module.exports = new StoreTemplate()
