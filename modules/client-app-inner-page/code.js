const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {

  function anchorPoints () {
    let foundAnchorPoints = utils
      .findAnchorPoints(config, '<!-- Page tab insertion point -->')
      .filter(e => e.info.pagePath)

    if (!foundAnchorPoints.length) {
      console.log('There are no insertion points available for this element. Please add a page first.')
      process.exit(1)
    }

    return foundAnchorPoints.map(e => { return {
      title: `${e.file} -- ${e.info.description} (${utils.humanizeAnchorPoint(e.anchorPoint)})`,
      value: {
        file: e.file,
        anchorPoint: e.anchorPoint,
        pagePath: e.info.pagePath,
      }
    }})
  }

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
      type: 'text',
      name: 'elementTitle',
      message: 'Element title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    },

    {
      type: 'select',
      name: 'destination',
      message: 'Destination element',
      choices: anchorPoints()
    },
    {
      type: 'text',
      name: 'subPath',
      message: prev => `Nested URL, coming from ${prev.pagePath}`,
      validate: value => !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/) ? 'Valid URLs, starting with "/" or "#"' : true
    },
  ]
  return questions
}

exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-inner-page']

  // New page's info
  // No placement by default
  const newElementInfo = config.vars.newElementInfo = {
    baseClass: 'PageElement',
    pagePath: `${userInput.destination.pagePath }${userInput.subPath}`,
    type: userInput.type,
    name: `${config.vars.elPrefix}-${userInput.elementName}`,
    nameNoPrefix: userInput.elementName,
    title: userInput.elementTitle,
    placeElement: false,
    subPath: config.userInput['client-app-inner-page'].subPath,
    parentElementPath: userInput.destination.file,
    anchorPoint: userInput.destination.anchorPoint
  }

  newElementInfo.importPath = `./${path.basename(userInput.destination.file,'.js')}/${config.vars.newElementInfo.name}.js`

  newElementInfo.fullPath = path.join(
    config.vars.newElementInfo.parentElementPath.split('.').slice(0, -1).join('.'),
    `${config.vars.newElementInfo.name}.js`
  )

}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.newElementInfo.type) return

  debugger

  switch (file) {
    case 'standard-PREFIX-ELEMENTNAME.js':
    case 'list-PREFIX-ELEMENTNAME.js':
    case 'view-PREFIX-ELEMENTNAME.js':
    case 'edit-PREFIX-ELEMENTNAME.js':
      return config.vars.newElementInfo.fullPath
      break
    default:
      return file
  }
}
