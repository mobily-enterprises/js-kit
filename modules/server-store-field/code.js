const path = require('path')
const utils = require('../../utils.js')
const prompts = require('prompts')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
}


exports.postPrompts = async (config) => {


  const allStores = utils.allStores(config)
  if (!allStores.length) return

  const store =  (await prompts([
    {
      type: 'select',
      message: 'Store to add a field to',
      name: 'value',
      choices: utils.allStores(config)
    }
  ])).value

  debugger

  const storeObject = require(path.resolve('./', path.join(config.dstDir, store.file)) )

  const existingFields = storeObject.schema.structure
  const storeDefaults = storeObject

  const fields = await utils.getStoreFields(config, storeDefaults, existingFields)

  config.vars.newFields = { fields: utils.formatSchemaFieldsAsText(fields, 0), storeFile: store.file }

}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  return file
}
