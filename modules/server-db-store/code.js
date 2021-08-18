const path = require('path')
const utils = require('../../utils.js')
const prompts = require('prompts')

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
      type: (prev, values) => values.advanced && values.positioning ? 'text' : null,
      name: 'positionField',
      message: 'Name of positio field (VERY recommended: position',
      initial: 'position'
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
      type: (prev, values) => values.advanced ? 'text' : null,
      name: 'idProperty',
      message: 'Name of the id property (VERY recommended: "id"',
      initial: 'id'
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
  if (typeof userInput.idProperty === 'undefined') {
    userInput.idProperty = 'id'
  }
  if (typeof userInput.positionField === 'undefined') {
    userInput.positionField = 'position'
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

    console.log(fields)

    const searchableFields = Object.keys(fields).filter(f => fields[f].searchable).map(e => { return  { title: e, value: e }} )
    if (searchableFields.length) {
      userInput.sortableFields = (await prompts({
        name: 'value',
        message: 'Which fields are sortable?',
        type: 'multiselect',
        choices: searchableFields
      })).value
      console.log('sortable fields:', userInput.sortableFields)
    }

    // Set positionFilter
    userInput.positionFilter = Object.keys(fields).filter(f => fields[f].isParent)
    
    console.log('POSITION FILTER:', userInput.positionFilter)
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
    case 'STORE.ejs':
      return `server/stores/${config.vars.newStoreInfo.version}/${config.vars.newStoreInfo.name}.js`
    default:
      return file
  }
}
