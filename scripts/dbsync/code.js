const utils = require('../../utils.js')
const path = require('path')

exports.script = (config) => {
  debugger
  console.log(config.userInput.storeToSync)
  console.log('SCRIPT RUN!')

  const storeToSync = config.userInput.storeToSync

  debugger
  const store = require(path.resolve(path.join(config.dstDir, storeToSync)))
  store.schemaDbSync()
}

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  function allStores () {
    debugger
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
