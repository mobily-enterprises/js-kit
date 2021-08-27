const utils = require('../../utils.js')
const path = require('path')

exports.script = async (config) => {

  // Make the DB connection
  const vars = require(path.resolve(path.join(config.dstDir, 'server', 'vars.js')))
  const makeDbConnection = require(path.resolve(path.join(config.dstDir, 'server', 'lib', 'makeDbConnection.js')))
  vars.connection = makeDbConnection(vars.config.db)

  const storeFile = config.userInput['dbsync'].storeToSync.file

  // Load all of the stores in memory first. This is crucial so that
  // schemaDbSync() can actually resolve the references for db constraints
  let foundStores = utils.allDbStores(config)
  for (const storeInfo of foundStores) {
    const store = require(path.resolve(path.join(config.dstDir, storeInfo.value.file)))
  }

  const store = require(path.resolve(path.join(config.dstDir, storeFile)))
  await store.schemaDbSync()

  vars.connection.end()

  console.log('Schema synched!')
}

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  return [
    {
      type: 'select',
      message: 'Store to sync',
      name: 'storeToSync',
      choices: utils.allDbStores(config)
    }
  ]
 }
