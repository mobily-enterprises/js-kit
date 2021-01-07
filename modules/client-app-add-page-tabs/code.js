const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
}

exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'text',
      name: 'elementId',
      message: 'Tab id',
      initial: '',
      validate: value => !value.match(/^[a-z]+[a-z0-9\-]*$/) ? 'Only lower case characters, numbers and dashes allowed' : true
    }
  ]

  return questions
}
exports.boot = (config) => {
}

exports.preAdd = (config) => {
}

exports.postAdd = async (config) => {

  const textManipulations = [
    {
       "op":"insert",
       "position":"after",
       "newlineAfter":true,
       "anchorPoint":"<!-- Element insertion point -->",
       "valueFromFile":"page-tabs.js"
    }
  ]

  utils.runInsertionManipulations(config, '<!-- Element insertion point -->', textManipulations)
}

exports.fileRenamer = (config, file) => {
}
