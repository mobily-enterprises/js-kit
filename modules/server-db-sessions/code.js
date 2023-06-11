const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}

  answers.secret = await utils.prompt({

    type: 'text',
    message: 'Session secret sentence',
    initial: '',
    required: true
  })

  answers.key = await utils.prompt({
    type: 'text',
    message: 'Session key (in cookie)',
    initial: config.dstPackageJsonValues.name,
    required: true
  })

  return answers
}

exports.preAdd = (config) => { }

exports.postAdd = (config) => { }
