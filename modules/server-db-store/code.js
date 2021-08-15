const path = require('path')
const utils = require('../../utils.js')


/*
NOTE: Extra fields for DB stores:

this.connection = this.constructor.connection
this.table = this.constructor.table
this.positionFilter = this.constructor.positionFilter

Eventually, ask if it's a DB store. And if it is, ask for table and add connection as an attribute from vars
*/

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  let storeName
  let version

  const questions = [
    {
      type: 'text',
      name: 'name',
      message: 'Store name (camel case, starting with lower case)',
      initial: '',
      validate: utils.storeNameValidator(config)
    },
    {
      type: 'text',
      name: 'version',
      message: (prev, values) => { storeName = values.name; return 'Store version' },
      initial: config.vars.defaultStoreVersion,
      validate: (value) => {
        return utils.storeVersionValidator(config, value, storeName)
      }
    },
    {
      type: 'text',
      name: 'publicURL',
      message:  (prev, values) => `Store URL. /${values.version}`,
      initial: (prev, values) => `/${values.name}`,
      validate: utils.storePublicURLValidator(config)
    },
    {
      type: 'text',
      name: 'table',
      message: 'DB table name',
      initial: (prev) => `${storeName}`,
      validate: utils.storeNameValidator(config)
    },
    {
      type: 'confirm',
      name: 'positioning',
      message: 'Should the store manage positioning of rows?',
      initial: true
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
      type: 'confirm',
      name: 'addFields',
      message: 'Would you like to set this store\'s fields?',
      initial: true
    },

  ]

  return questions
}

exports.postPrompts = async (config) => {
  const userInput = config.userInput['server-db-store']

  // Set defaults in case some questions weren't asked
  // Falsy ones don't need to be set regardless
  if (typeof userInput.fullRecordOnInsert === 'undefined') {
    userInput.fullRecordOnInsert = true
  }
  if (typeof userInput.beforeIdFields === 'undefined') {
    userInput.beforeIfFields = 'beforeId'
  }

  if (userInput.addFields) {

    const storeDefaults = userInput
    fields = await utils.getStoreFields(config, storeDefaults)

    // TODO:
    // List sortable fields (amongst the searchable ones)
    // Specify positionFilter

    console.log('ASKED TO ADD FIELDS!', fields)
  }

  // New store's info
  const newStoreInfo = config.vars.newStoreInfo = {
    ...userInput,
    className: config.utils.capitalize(userInput.name),
    db: true
  }
}



exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'STORE.js':
      return `server/stores/${config.vars.newStoreInfo.version}/${config.vars.newStoreInfo.name}.js`
    default:
      return file
  }
}
