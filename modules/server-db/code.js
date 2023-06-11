const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}
  //
  answers.dbHost = await utils.prompt({
    type: 'text',
    message: 'DB host',
    initial: 'localhost'
  })

  answers.dbPort = await utils.prompt({
    type: 'text',
    message: 'DB port',
    initial: '3306'
  })

  answers.db = await utils.prompt({
    type: 'text',
    message: 'DB name',
    initial: 'jskit'
  })

  answers.dbUser = await utils.prompt({
    type: 'text',
    message: 'DB user',
    initial: 'root'
  })

  answers.dbPassword = await utils.prompt({
    type: 'text',
    message: 'DB password',
    initial: ''
  })

  return answers
}

exports.preAdd = (config) => { }

exports.postAdd = (config) => { }
