const path = require('path')
const utils = require('../../utils.js')
const prompts = require('prompts')
const installModule = require('../../node_modules/scaffoldizer/commands/add.js').installModule
const runScript = require('../../node_modules/scaffoldizer/commands/run.js').runScript

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => { }

exports.postPrompts = async (config) => {
  let fields
  let storeName
  let version

  config.userInput['server-store'] = {}

  const typeOfStore = config.userInput['server-store'].typeOfStore = (await prompts({
    name: 'value',
    message: 'What type of store is it?',
    type: 'select', 
    choices: [
      { title: 'DB store', value: 'db' },
      { title: 'Memory store (non-stored values)', value: 'memory' },
      { title: 'API store (to be implemented manually)', value: 'api' },
      { title: 'Cancel', value: 'quit' },
    ]
  })).value

  // Install server-db module if it's a db store
  // (Automatically skipped if it's already installed)
  // This call is the reason why these prompts are not in the getPrompts() hook
  if (typeOfStore === 'db') {
    await installModule('server-db', config)
  }

  // The getPrompts input is skipped altogether as there are
  // conditional questions 
  config.userInput['server-store'] = await prompts([
    {
      type: 'text',
      name: 'storeName',
      message: 'Store name (camel case, starting with lower case)',
      initial: '',
      validate: utils.storeNameValidator(config)
    },
    
    {
      type: 'text',
      name: 'version',
      message: (prev, values) => { storeName = values.storeName; return 'Store version' },
      initial: config.vars.defaultStoreVersion,
      validate: (value) => {
        return utils.storeVersionValidator(config, value, storeName)
      }
    },
    {
      type: 'text',
      name: 'publicURL',
      message:  (prev, values) => `Store URL. /${values.version}`,
      initial: (prev, values) => `/${values.storeName}`,
      validate: utils.storePublicURLValidator(config)
    },
    {
      type: () => typeOfStore === 'db' ? 'text' : null,
      name: 'table',
      message: 'DB table name',
      initial: (prev) => `${storeName}`,
      validate: utils.storeNameValidator(config)
    },
    {
      type: 'confirm',
      name: 'positioning',
      message: 'Should the store manage positioning of rows?',
      initial: false
    },
    
    {
      type: 'multiselect',
      name: 'methods',
      message: 'Which HTTP methods?',
      choices: utils.storeMethodsChoices,
    },
    {
      type: 'confirm',
      name: 'advanced',
      message: 'Would you like to set more advanced options?',
      initial: false
    },

    {
      type: (prev, values) => values.advanced ? 'confirm' : null,
      name: 'canBeNull',
      message: 'Is NULL allowed for field by default? (recommended: false)',
      initial: false
    },

    {
      type: (prev, values) => values.advanced ? 'confirm' : null,
      name: 'emptyAsNull',
      message: 'Are empty values to be stored as NULL by default, rather "" or 0? (recommended: false)',
      initial: false
    },

    {
      type: (prev, values) => values.advanced ? 'number' : null,
      name: 'defaultLimitOnQueries',
      message: 'Maximum number of results returned',
      min: 10,
      initial: 1000
    },

    {
      type: (prev, values) => values.advanced ? 'confirm' : null,
      name: 'fullRecordOnUpdate',
      message: 'On update, cast fields to their defaults if they are not set (VERY recommended: false)',
      initial: false
    },

    {
      type: (prev, values) => values.advanced ? 'confirm' : null,
      name: 'fullRecordOnInsert',
      message: 'On insert, cast fields to their defaults if they are not set (VERY recommended: true)',
      initial: true
    },

    {
      type: (prev, values) => values.advanced ? 'text' : null,
      name: 'beforeIdField',
      message: 'Name of non-schema field allowed on insert/update to specify positioning',
      initial: 'beforeId'
    },

    {
      type: (prev, values) => values.advanced && typeofStore === 'db' && values.positioning ? 'text' : null,
      name: 'positionField',
      message: 'Name of position field used by the DB server to keep track of positions (VERY recommended: position)',
      initial: 'position'
    },

    {
      type: (prev, values) => values.advanced ? 'text' : null,
      name: 'idProperty',
      message: 'Name of the id property (VERY recommended: "id")',
      initial: 'id'
    },

    {
      type: 'confirm',
      name: 'addFields',
      message: 'Would you like to set this store\'s fields?',
      initial: true
    },
  ])

  const userInput = config.userInput['server-store']

  userInput.typeOfStore = typeOfStore
  // Set defaults in case some questions weren't asked
  // Falsy ones don't need to be set regardless
  if (typeof userInput.fullRecordOnInsert === 'undefined') {
    userInput.fullRecordOnInsert = true
  }
  if (typeof userInput.beforeIdField === 'undefined') {
    userInput.beforeIdField = 'beforeId'
  }
  if (typeof userInput.idProperty === 'undefined') {
    userInput.idProperty = 'id'
  }
  if (typeof userInput.positioning === 'undefined') {
    userInput.positioning = false
  }
  if (typeOfStore === 'db' && typeof userInput.positionField === 'undefined') {
    userInput.positionField = 'position'
  }
  if (typeof userInput.defaultLimitOnQueries === 'undefined') {
    userInput.defaultLimitOnQueries = 1000
  }

  if (userInput.addFields) {

    const storeDefaults = userInput

    const existingFields = {}
    if (userInput.positioning) {
      existingFields[userInput.positionField] = { type: 'number'}
    }

    fields = await utils.getStoreFields(config, storeDefaults, existingFields)

    // This will add positioning if set
    fields = {...fields, ...existingFields}

    const searchableFields = Object.keys(fields).filter(f => fields[f].searchable).map(e => { return  { title: e, value: e }} )
    if (searchableFields.length) {
      userInput.sortableFields = (await prompts({
        name: 'value',
        message: 'Which fields are sortable?',
        type: 'multiselect',
        choices: searchableFields
      })).value
    } else {
      userInput.sortableFields = []
    }
  }

  // New store's info
  const newStoreInfo = config.vars.newStoreInfo = {
    ...userInput,
    fields,
    db: true,
    asText: {
      sortableFields: utils.nativeVar(userInput.sortableFields),
      fields: utils.formatSchemaFieldsAsText(fields),
    }
  }
  
  if (typeOfStore === 'db') {
    newStoreInfo.positionFilter = Object.keys(fields).filter(f => fields[f].isParent)
    newStoreInfo.asText.positionFilter = utils.nativeVar(newStoreInfo.positionFilter)
  }
}

exports.boot = (config) => { }

exports.postAdd = async (config) => {
  if (config.userInput['server-store'].typeOfStore === 'db') {
    const syncUp = (await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Would you like to sync up the DB\'s schema with this store?',
      initial: true
    })).value

    if (syncUp) {
      runScript('dbsync', config, {
        storeToSync: { 
          file: `server/stores/${config.vars.newStoreInfo.version}/${config.vars.newStoreInfo.storeName}.js`,
          version: config.vars.newStoreInfo.version,
          name: config.vars.newStoreInfo.storeName 
        }
      })
    }
  }
}


exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'STORE.ejs':
      return `server/stores/${config.vars.newStoreInfo.version}/${config.vars.newStoreInfo.storeName}.js`
    default:
      return file
  }
}
