const utils = require('../../utils.js')

exports.script = async (config) => {
  console.log(config.userInput.storeToSync)
  console.log('SCRIPT RUN!')

  let foundStores = utils
    .allFiles(config)
    .filter(f => f.info.storeName && f.info.storeTable)

  debugger
  for (const storeInfo of foundStores) {
    const storeToSync = storeInfo.file
    const store = require(path.resolve(path.join(config.dstDir, storeToSync)))
    await store.schemaDbSync()
  }
}

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => { }
