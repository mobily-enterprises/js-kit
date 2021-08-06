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
      message:  (prev, values) => { version = values.version; return `Store URL. /${version}` },
      initial: (prev) => `/${storeName}`,
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
      name: 'addFields',
      message: 'Would you like to set this store\'s fields?',
      initial: true
    },

  ]

  return questions
}



exports.postPrompts = async (config) => {
  const userInput = config.userInput['server-db-store']

  if (userInput.addFields) {

    fields = await utils.getStoreFields()

    console.log('ASKED TO ADD FIELDS!', fields)
  }

  // New store's info
  const newStoreInfo = config.vars.newStoreInfo = {
    name: userInput.name,
    version: userInput.version,
    className: config.utils.capitalize(userInput.name),
    methods: userInput.methods,
    version: userInput.version,
    publicURL: userInput.publicURL,
    implementation: userInput.implementation,
    table: userInput.table,
    positioning: userInput.positioning,
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
