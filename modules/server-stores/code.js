const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'text',
      name: 'publicURLprefix',
      message: 'URL prefix for all stores',
      initial: 'stores',
      validate: utils.publicURLprefixValidator(config)
    },
    {
      type: 'text',
      name: 'defaultVersion',
      message: 'Default store version',
      initial: '1.0.0',
      validate: (value) => {
        return !value.match(/^[0-9]+\.[0-9]\.[0-9]$/)
          ? 'Must be in format n.n.n E.g. 2.0.0'
          : true
      }
    },
  ]

  return questions
}

exports.boot = (config) => {
  config.vars.defaultStoreVersion =  config.userInput['server-stores'].defaultVersion
}

exports.preAdd = (config) => { }

exports.postAdd = (config) => { }
