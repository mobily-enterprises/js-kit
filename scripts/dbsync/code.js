const utils = require('../../utils.js')
const path = require('path')

exports.script = async (config) => {
  console.log(config.userInput.storeToSync)

  // Make the DB connection
  const vars = require(path.resolve(path.join(config.dstDir, 'server', 'vars.js')))
  const makeDbConnection = require(path.resolve(path.join(config.dstDir, 'server', 'lib', 'makeDbConnection.js')))
  vars.connection = makeDbConnection(vars.config.db)

  const storeToSync = config.userInput.storeToSync

  const store = require(path.resolve(path.join(config.dstDir, storeToSync)))

  await store.schemaDbSync()

  vars.connection.end()

  console.log('Schema synched!')
}

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  function allStores () {
    let foundStores = utils
      .allFiles(config)
      .filter(f => f.info.storeName && f.info.storeTable)

    return foundStores.map(e => { return { title: `/${e.info.storeVersion}/${e.info.storeName}`, value: e.file } } )
  }

  return [
    {
      type: 'select',
      message: 'Store to sync',
      name: 'storeToSync',
      choices: allStores()
    }
  ]
 }
