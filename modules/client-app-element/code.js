const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  function anchorPoints () {
    const foundAnchorPoints = utils
      .findAnchorPoints(config, ['<!-- Element insertion point -->', '<!-- Element tab insertion point -->'])
      // .filter(e => e.info.pagePath)

    if (!foundAnchorPoints.length) {
      console.log('There are no insertion points available for this element. Please add a page first.')
      process.exit(1)
    }

    return foundAnchorPoints.map(e => { return { title: `${e.file} -- ${e.info.description} ${utils.humanizeAnchorPoint(e.anchorPoint)}`, value: { file: e.file, anchorPoint: e.anchorPoint } } } )
  }

  const questions = [
    utils.elementTypeQuestion(config, 'element'),
    {
      type: 'text',
      name: 'elementName',
      message: 'Element name',
      initial: '',
      validate: (value) => {
        return utils.elementNameValidator(config, value)
      }
    },
    {
      type: 'confirm',
      name: 'placeElement',
      message: 'Would you like to place the element somewhere?',
      initial: true
    },
    {
      type: prev => prev ? 'select' : null,
      name: 'destination',
      message: 'Destination element',
      choices: anchorPoints()
    }
  ]

  return questions
}

/*
 # APP ELEMENT CONTRACT

Template: plain-PREFIX-ELEMENTNAME.js

Utils variables:
- newElementInfo.type (common)

Template variables:
- newElementInfo.baseClass (common)
- newElementInfo.libPath (common)
- newElementInfo.ownPath (common)
- newElementInfo.pagePath (common)
- newElementInfo.ownHeader (common)
- newElementInfo.menuTitle (common)
- newElementInfo.name (common)
- newElementInfo.nameNoPrefix (common)

- newElementInfo.store (common, edit)

JSON5 contract:
- newElementInfo.name (common)
- newElementInfo.nameNoPrefix (common)
- newElementInfo.copyToDirectory (common)

- newElementInfo.placeElement (prompt)
- newElementInfo.destination (.file and .anchorPoint) (prompt)
- newElementInfo.inTab
- newElementInfo.importPath
*/
exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-element']

  /* COMMON PROPS */
  let store = null
  const type = userInput.type || 'plain'
  userInput.elementName = utils.elementNameFromInput(userInput.elementName, userInput.type)
  const baseClass = utils.appBaseClass(type)
  const libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'

  if (type !== 'plain') {
    store = await utils.askStoreQuestions(config)
  }

  const fieldElements = utils.fieldElements(type, config, userInput, store)

  const name = `${config.vars.elPrefix}-${userInput.elementName}`
  const nameNoPrefix = userInput.elementName
  let copyToDirectory = 'src/elements'

  /* EXTRA PROPS */
  const placeElement = userInput.placeElement && userInput.destination
  const destination = placeElement ? userInput.destination : {}
  const inTab = userInput.destination.anchorPoint === '<!-- Element tab insertion point -->'
  const importPath = placeElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
  if (placeElement) copyToDirectory = `${path.dirname(destination.file)}${path.sep}${path.basename(destination.file, '.js')}${path.sep}elements`

  /* RETURN THE RESULT OBJECT */
  config.vars.newElementInfo = {
    type,
    baseClass,
    libPath,
    ownPath: false,
    pagePath: null,
    ownHeader: false,
    menuTitle: null,
    name,
    nameNoPrefix,
    copyToDirectory,
    store,

    placeElement,
    destination,
    inTab,
    importPath,

    /* add/edit elements */
    fieldElements
  }
}

exports.postAdd = utils.commonElementManupulations

exports.boot = (config) => { }

exports.fileRenamer = utils.commonElementFileRenamer