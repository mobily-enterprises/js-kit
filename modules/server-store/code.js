const utils = require('../../utils.js')
const installModule = require('../../node_modules/scaffoldizer/commands/add.js').installModule
const runScript = require('../../node_modules/scaffoldizer/commands/run.js').runScript

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

const maybePositionField = (positionField) => {
  return positionField
    ? { [positionField]: { type: 'number' } }
    : {}
}

exports.getPrompts = async (config) => {
  const answers = {}

  answers.typeOfStore = await utils.prompt({
    message: 'What type of store is it?',
    type: 'select',
    choices: [
      { title: 'DB store', value: 'db' },
      { title: 'Memory store (non-stored values)', value: 'memory' },
      { title: 'API store (to be implemented manually)', value: 'api' },
      { title: 'Cancel', value: 'quit' }
    ]
  })

  // Install server-db module if it's a db store
  // (Automatically skipped if it's already installed)
  // This call is the reason why these prompts are not in the getPrompts() hook
  if (answers.typeOfStore === 'db') {
    await installModule('server-db', config)
  }

  // The getPrompts input is skipped altogether as there are
  // conditional questions
  answers.storeName = await utils.prompt({
    type: 'text',
    message: 'Store name (camel case, starting with lower case)',
    initial: '',
    validate: utils.storeNameValidator(config)
  })

  answers.version = await utils.prompt({
    type: 'text',
    message: 'Store version',
    initial: config.vars.defaultStoreVersion,
    validate: (value) => {
      return utils.storeVersionValidator(config, value, answers.storeName)
    }
  })

  answers.publicURL = await utils.prompt({
    type: 'text',
    message: `Store URL. /${answers.version}`,
    initial: `/${answers.storeName}`,
    validate: utils.storePublicURLValidator(config)
  })

  if (answers.typeOfStore === 'db') {
    answers.table = await utils.prompt({
      message: 'DB table name',
      initial: answers.storeName,
      validate: utils.storeNameValidator(config)
    })
  }

  answers.positioning = await utils.prompt({
    type: 'confirm',
    message: 'Should the store manage positioning of rows?',
    initial: false
  })

  answers.methods = await utils.prompt({
    type: 'multiselect',
    message: 'Which HTTP methods?',
    choices: utils.storeMethodsChoices
  })

  const advanced = await utils.prompt({
    name: 'advanced',
    message: 'Would you like to set more advanced options?',
    initial: false
  })

  if (advanced) {
    answers.canBeNull = await utils.prompt({
      type: 'confirm',
      message: 'Is NULL allowed for field by default? (recommended: false)',
      initial: false
    })

    answers.emptyAsNull = await utils.prompt({
      type: 'confirm',
      message: 'Are empty values to be stored as NULL by default, rather "" or 0? (recommended: false)',
      initial: false
    })

    answers.defaultLimitOnQueries = await utils.prompt({
      type: 'text',
      message: 'Maximum number of results returned',
      min: 10,
      initial: 1000
    })

    answers.fullRecordOnUpdate = await utils.prompt({
      type: 'text',
      message: 'On update, cast fields to their defaults if they are not set (VERY recommended: false)',
      initial: false
    })

    answers.fullRecordOnInsert = await utils.prompt({
      type: 'text',
      message: 'On insert, cast fields to their defaults if they are not set (VERY recommended: true)',
      initial: true
    })

    answers.beforeIdField = await utils.prompt({
      type: 'text',
      message: 'Name of non-schema field allowed on insert/update to specify positioning',
      initial: 'beforeId'
    })

    if (answers.positioning) {
      answers.positionField = await utils.prompt({
        type: 'text',
        message: 'Name of position field used by the DB server to keep track of positions (VERY recommended: position)',
        initial: 'position'
      })
    }

    answers.idProperty = await utils.prompt({
      type: 'text',
      message: 'Name of the id property (VERY recommended: "id")',
      initial: 'id'
    })

  }

  answers.addFields = await utils.prompt({
    type: 'confirm',
    message: 'Would you like to set this store\'s fields?',
    initial: true
  })

  if (answers.addFields) {
    answers.fields = await utils.getStoreFields(config, answers, maybePositionField(answers.positionField))

    const searchableFields = Object.keys(answers.fields).filter(f => answers.fields[f].searchable).map(e => { return { title: e, value: e } })
    if (searchableFields.length) {
      answers.sortableFields = await utils.prompt({
        type: 'multiselect',
        message: 'Which fields are sortable?',
        choices: searchableFields
      })
    } else {
      answers.sortableFields = []
    }
  }

  if (answers.typeOfStore === 'db') {
    answers.syncUp = await utils.prompt({
      type: 'confirm',
      message: 'Would you like to sync up the DB\'s schema with this store?',
      initial: true
    })
  }

  return answers
}

exports.postPrompts = (config, answers) => {
  // Set defaults in case some questions weren't asked
  // Falsy ones don't need to be set regardless
  let newStoreInfo = { ...answers }

  if (!answers.advanced) {
    newStoreInfo.fullRecordOnInsert = true
    newStoreInfo.beforeIdField = 'beforeId'
    newStoreInfo.idProperty = 'id'
    newStoreInfo.positioning = false
    if (answers.typeOfStore === 'db') newStoreInfo.positionField = 'position'
    newStoreInfo.defaultLimitOnQueries = 1000
  }

  // New store's info
  newStoreInfo = {
    ...newStoreInfo,
    fields: { ...maybePositionField(answers.positionField), ...answers.fields },
    db: true,
    asText: {
      sortableFields: utils.nativeVar(answers.sortableFields),
      fields: utils.formatSchemaFieldsAsText(answers.fields)
    }
  }

  if (answers.typeOfStore === 'db') {
    newStoreInfo.positionFilter = Object.keys(answers.fields).filter(f => answers.fields[f].isParent)
    newStoreInfo.asText.positionFilter = utils.nativeVar(newStoreInfo.positionFilter)
  }
  config.vars.newStoreInfo = newStoreInfo
}

exports.boot = (config) => { }

exports.postAdd = async (config) => {
  if (config.userInput['server-store'].syncUp) {
    runScript('dbsync', config, {
      storeToSync: {
        file: `server/stores/${config.vars.newStoreInfo.version}/${config.vars.newStoreInfo.storeName}.js`,
        version: config.vars.newStoreInfo.version,
        name: config.vars.newStoreInfo.storeName
      }
    })
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
