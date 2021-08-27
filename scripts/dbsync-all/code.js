const utils = require('../../utils.js')
const path = require('path')

exports.script = async (config) => {


  // Make the DB connection
  const vars = require(path.resolve(path.join(config.dstDir, 'server', 'vars.js')))
  const makeDbConnection = require(path.resolve(path.join(config.dstDir, 'server', 'lib', 'makeDbConnection.js')))
  vars.connection = makeDbConnection(vars.config.db)

  let foundStores = utils.allDbStores(config)
  
  for (const storeInfo of foundStores) {
    const storeFile = storeInfo.value.file
    console.log('Syncing', storeFile)
    const store = require(path.resolve(path.join(config.dstDir, storeFile)))
    await store.schemaDbSync()
  }
  vars.connection.end()

}

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => { }
