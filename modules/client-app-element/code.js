const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
}

exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'select',
      name: 'type',
      message: 'Which type of element?',
      choices: [
        {
          title: 'Standard element',
          value: 'standard'
        },
        {
          title: 'List element',
          value: 'list'
        },
        {
          title: 'View element',
          value: 'view'
        },
        {
          title: 'Edit element',
          value: 'edit'
        },
      ]
    },
    {
      type: 'text',
      name: 'elementName',
      message: 'Element name',
      initial: '',
      validate: value => !value.match(/^[a-z]+[a-z0-9\-]*$/) ? 'Only lower case characters, numbers and dashes allowed' : true
    }
  ]

  return questions
}
exports.boot = (config) => {
}

exports.preAdd = (config) => {
  // const prefix = config.utils.capitalize(config.utils.toCamelCase(config.vars.elPrefix))
  // const name = config.utils.capitalize(config.utils.toCamelCase(config.userInput['client-app-root-page'].elementName))
  config.vars.newElementFullNameNoPrefix = `${config.userInput['client-app-element'].elementName}`
  config.vars.newElementFullName = `${config.vars.elPrefix}-${config.userInput['client-app-element'].elementName}`

  config.vars.type = config.userInput['client-app-element'].type
  config.vars.elementName = config.userInput['client-app-element'].elementName
  config.vars.elementTitle = config.userInput['client-app-element'].elementTitle
  config.vars.elementMenuTitle = config.userInput['client-app-element'].elementMenuTitle
  config.vars.baseClass = 'AppElement'
}

exports.postAdd = (config) => {
  const textManipulations = [
    {
       "op":"insert",
       "position":"after",
       "newlineAfter":true,
       "newlineBefore":true,
       "anchorPoint":"<!-- Element insertion point -->",
       "value":"<<%=vars.elementName%>></<%=vars.elementName%>>"
    }
  ]

  const selfPathToExclude = `src/elements/${config.vars.newElementFullName}.js`
  utils.runInsertionManipulations(config, '<!-- Element insertion point -->', textManipulations, selfPathToExclude)
}

exports.fileRenamer = (config, file) => {

  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.type) return

  switch (file) {
    case 'standard-PREFIX-ELEMENTNAME.js': return `src/elements/${config.vars.newElementFullName}.js`
    case 'list-PREFIX-ELEMENTNAME.js': return `src/elements/list-${config.vars.newElementFullName}.js`
    case 'view-PREFIX-ELEMENTNAME.js': return `src/elements/view-${config.vars.newElementFullName}.js`
    case 'edit-PREFIX-ELEMENTNAME.js': return `src/elements/edit-${config.vars.newElementFullName}.js`
    default: return file
  }
}
