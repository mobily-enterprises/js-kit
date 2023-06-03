const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  const storesAvailable = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  const questions = [

    // Element name (checked with validator)
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
      type: storesAvailable ? 'select' : null,
      name: 'type',
      message: 'Which type of element?',
      choices: [
        {
          title: 'Plain (no store)',
          value: 'plain'
        },
        {
          title: 'List (using a store)',
          value: 'list'
        },
        {
          title: 'View (using a store)',
          value: 'view'
        },
        {
          title: 'Edit (using a store)',
          value: 'edit'
        }
      ]
    },

    {
      type: 'select',
      name: 'placement',
      message: "What is the element's placement?",
      choices: [
        {
          title: 'Placed as a root page',
          value: 'root-page'
        },
        {
          title: 'Placed as a sub page',
          value: 'page'
        },
        {
          title: 'Placed as as general, shared element',
          value: 'global-element'
        },
        {
          title: 'Placed as a pace-specific element',
          value: 'page-specific-element'
        }
      ]
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

  /*
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

    // This is needed if the palcement is general-element or page-element
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
  */

  /* COMMON PROPS */
  let store = null
  const type = userInput.type || 'plain'
  const placement = userInput.placement
  userInput.elementName = utils.elementNameFromInput(userInput.elementName, userInput.type)
  const baseClass = utils.elementBaseClass(type)
  const baseMixin = utils.elementBaseMixin(type, placement)

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
    baseMixin,
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

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'PREFIX-ELEMENTNAME.ejs':
      return `${config.vars.newElementInfo.copyToDirectory}/${config.vars.newElementInfo.name}.js`
    default:
      return file
  }
}
