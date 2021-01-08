const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.getPrompts = (config) => { }


exports.getPrompts = (config) => {
  const anchorPoints = [
    'Page tab insertion point'
  ]
  let foundAnchorPoints = config.utils.findAnchorPoints(anchorPoints, config.dstDir, utils.getFileInfo)

  if (!foundAnchorPoints.length) {
    console.log('No suitable page for an inner page found')
    return false
  }

  return [
    {
      type: 'select',
      name: 'type',
      message: 'Which type of page?',
      choices: [
        {
          title: 'Standard page',
          value: 'standard'
        },
        {
          title: 'List page',
          value: 'list'
        },
        {
          title: 'View page',
          value: 'view'
        },
        {
          title: 'Edit page',
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
      type: 'text',
      name: 'elementMenuTitle',
      message: 'Element menu title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    },
    {
      type: 'select',
      name: 'destination',
      message: 'Destination element',
      choices: foundAnchorPoints.map(e => { return { title: `${e.file} -- ${e.info.description}`, value: { file: e.file, anchorPoint: e.anchorPoint } } } )
    }
  ]
}
exports.boot = (config) => { }

exports.preAdd = (config) => {
  // const prefix = config.utils.capitalize(config.utils.toCamelCase(config.vars.elPrefix))
  // const name = config.utils.capitalize(config.utils.toCamelCase(config.userInput['client-app-inner-page'].elementName))
  config.vars.newElementFullNameNoPrefix = `${config.userInput['client-app-inner-page'].elementName}`
  config.vars.newElementFullName = `${config.vars.elPrefix}-${config.userInput['client-app-inner-page'].elementName}`
  config.vars.type = config.userInput['client-app-inner-page'].type
  config.vars.elementName = config.userInput['client-app-inner-page'].elementName
  config.vars.elementTitle = config.userInput['client-app-inner-page'].elementTitle
  config.vars.elementMenuTitle = config.userInput['client-app-inner-page'].elementMenuTitle
  config.vars.baseClass = 'PageElement'
}

exports.postAdd = (config) => {
  if (!config.userInput['client-app-inner-page'].destination) {
    console.log('No destination selected')
    return
  }

}

exports.fileRenamer = (config, file) => {

  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.type) return

  switch (file) {
    case 'standard-PREFIX-ELEMENTNAME.js': return `src/pages/${config.vars.newElementFullName}.js`
    case 'list-PREFIX-ELEMENTNAME.js': return `src/pages/list-${config.vars.newElementFullName}.js`
    case 'view-PREFIX-ELEMENTNAME.js': return `src/pages/view-${config.vars.newElementFullName}.js`
    case 'edit-PREFIX-ELEMENTNAME.js': return `src/pages/edit-${config.vars.newElementFullName}.js`
    default: return file
  }
}
