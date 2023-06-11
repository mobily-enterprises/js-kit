const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}

  answers.publicURLprefix = await utils.prompt({
    type: 'text',
    message: 'URL prefix for all stores',
    initial: 'stores',
    validate: utils.publicURLprefixValidator(config)
  })

  answers.defaultVersion = await utils.prompt({
    type: 'text',
    message: 'Default store version',
    initial: '1.0.0',
    validate: (value) => {
      return !value.match(/^[0-9]+\.[0-9]\.[0-9]$/)
        ? 'Must be in format n.n.n E.g. 2.0.0'
        : true
    }
  })

  return answers
}

exports.boot = (config) => {
  config.vars.defaultStoreVersion = config.userInput['server-stores'].defaultVersion
}

exports.preAdd = (config) => { }

exports.postAdd = (config) => { }
