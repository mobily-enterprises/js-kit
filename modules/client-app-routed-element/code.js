const path = require('path')
const utils = require('../../utils.js')


exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {

  let globalPrev

  function anchorPoints () {
    let foundAnchorPoints = utils
      .findAnchorPoints(config, '<!-- Routed element tab insertion point -->')
      // .filter(e => e.info.pagePath)

    if (!foundAnchorPoints.length) {
      console.log('There are no insertion points available for this element. Please add a page first.')
      process.exit(1)
    }

    return foundAnchorPoints.map(e => { return {
      title: `${e.file} -- ${e.info.description} ${utils.humanizeAnchorPoint(e.anchorPoint)}`,
      value: {
        file: e.file,
        anchorPoint: e.anchorPoint,
        pagePath: e.info.pagePath,
      }
    }})
  }

  const questions = [
    utils.elementTypeQuestion(config, 'element'),
    {
      type: 'text',
      name: 'elementName',
      message: 'Element name',
      initial: '',
      validate: (value) => {
        return utils.elementNameValidator(config, value, globalPrev)
      }
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
      message: (prev) => { globalPrev = prev; return `Nested URL, coming from ${prev.pagePath}` },
      validate: (value) => {
        return utils.pagePathValidator(config, value, globalPrev)
      }
    },
  ]
  return questions
}

exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-routed-element']

  if (!userInput.type) userInput.type = 'plain'
  userInput.elementName = utils.elementNameFromInput(config, userInput.elementName, userInput.type)
  const baseClass = utils.pageBaseClass(userInput.type)

  if (userInput.type !== 'plain') {
    const extraStoreInput = await utils.askStoreQuestions(config)
    userInput = { ...userInput, ...extraStoreInput }

    // For AddEdit, use function to work out form string
    // Run the transformation to add those fields
  }
 
  // New page's info
  // No placement by default
  const newElementInfo = config.vars.newElementInfo = {
    baseClass: 'RoutedElement',
    ownHeader: false,
    ownPath: true,
    pagePath: `${userInput.destination.pagePath }${userInput.subPath}`,
    type: userInput.type,
    name: `${config.vars.elPrefix}-${userInput.elementName}`,
    nameNoPrefix: userInput.elementName,
    subPath: userInput.subPath,
    anchorPoint: userInput.destination.anchorPoint
  }

  newElementInfo.importPath = `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${newElementInfo.name}.js`
  newElementInfo.destination =  userInput.destination
  newElementInfo.destinationDirectory = `${path.dirname(newElementInfo.destination.file)}${path.sep}${path.basename(userInput.destination.file, '.js')}${path.sep}elements`
  newElementInfo.libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'
}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.newElementInfo.type) return

  const destinationDirectory = config.vars.newElementInfo.destinationDirectory

  switch (file) {
    case 'plain-PREFIX-ELEMENTNAME.ejs':
    case 'list-PREFIX-ELEMENTNAME.ejs':
    case 'view-PREFIX-ELEMENTNAME.ejs':
    case 'edit-PREFIX-ELEMENTNAME.ejs':
    return `${destinationDirectory}/${config.vars.newElementInfo.name}.js`
      break
    default:
      return file
  }
}
