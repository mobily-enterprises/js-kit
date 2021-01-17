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
    }
  ]

  return questions
}

exports.preAdd = (config) => { }

exports.postAdd = (config) => { }
