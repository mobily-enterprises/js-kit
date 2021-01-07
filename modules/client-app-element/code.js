const path = require('path')
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
    },
    {
      type: 'confirm',
      name: 'placeElement',
      message: 'Would you like to place the element somewhere?',
      initial: true
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
  if (!config.userInput['client-app-element'].placeElement) return

  debugger

  const textManipulations = function (destination) {

    // DIsclaimer: I wrote this code when really, really tired (Tony)
    // Work out the full path of the file to import
    const fileToImport = `src/elements/${config.vars.newElementFullName}.js`
    // Work out the relative path from the two path's location. Note: if the files are in the same
    // spot, it will need to be assigned at least a "."
    let relativePath = path.relative(path.dirname(destination), path.dirname(fileToImport)) || '.'

    // Join them together. Note that `path.sep` is used since path.join will normalise things, and
    // eat away that './' (if present)
    const importPath = `${relativePath}${path.sep}${path.basename(fileToImport)}`

    return [
      {
         "op":"insert",
         "position":"after",
         "newlineAfter":true,
         "newlineBefore":true,
         "anchorPoint":"<!-- Element insertion point -->",
         "value":"<<%=vars.elementName%>></<%=vars.elementName%>>"
      },
      {
         "op":"insert",
         "position":"before",
         "newlineAfter":false,
         "anchorPoint":"/* Loaded modules -- end */",
         "value":`import '${importPath}'`
      }
    ]
  }

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
