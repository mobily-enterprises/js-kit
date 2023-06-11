const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}

  answers.store = null
  const allStores = utils.allStores(config)
  if (!allStores.length) return

  answers.store = await utils.prompt({
    type: 'select',
    message: 'Store to add a field to',
    choices: utils.allStores(config)
  })

  return answers
}

exports.postPrompts = async (config, answers) => {
  const storeObject = require(path.resolve('./', path.join(config.dstDir, answers.store.file)))

  const existingFields = storeObject.schema.structure
  const storeDefaults = storeObject

  const fields = await utils.getStoreFields(config, storeDefaults, existingFields)

  config.vars.newFields = { fields: utils.formatSchemaFieldsAsText(fields, 0), storeFile: answers.store.file }
}

exports.boot = (config) => { }
