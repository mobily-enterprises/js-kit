const utils = require('../../utils.js')

exports.script = (config) => {
  console.log(config.utils.loadModuleValues(config, 'server-stores'))
  console.log('SCRIPT RUN!')
}

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => { }
