const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

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
      name: 'layout',
      message: "What is the element's layout?",
      choices: [
        {
          title: 'A root page',
          value: 'root-page'
        },
        {
          title: 'A sub page',
          value: 'page'
        },
        {
          title: 'An element',
          value: 'element'
        }
      ]
    },

    {
      type: prev => prev === 'element' ? 'select' : null,
      name: 'scope',
      message: "What is the element's scope?",
      choices: [
        {
          title: 'Global. General purposes element used by several pagesa',
          value: 'global'
        },
        {
          title: 'Specific. A specific element only used, and needed, by another element',
          value: 'specific'
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

- newElementInfo.insertElement (prompt)
- newElementInfo.destination (.file and .anchorPoint) (prompt)
- newElementInfo.inTab
- newElementInfo.importPath
*/
exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-element']

  /*
    function anchorPoints () {
    const foundAnchorPoints = utils
      .findAnchorPoints(config, ['<!-- Element insertion point -->', '<!-- Page tab insertion point -->'])
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
      name: 'insertElement',
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
  const layout = userInput.layout
  const scope = userInput.scope
  userInput.elementName = utils.elementNameFromInput(userInput.elementName, userInput.type)
  const baseClass = utils.elementBaseClass(type)
  const baseMixin = utils.elementBaseMixin(type, layout)

  if (type !== 'plain') {
    store = await utils.askStoreQuestions(config)
  }

  const fieldElements = utils.fieldElements(type, config, userInput, store)

  const name = `${config.vars.elPrefix}-${userInput.elementName}`
  const nameNoPrefix = userInput.elementName

  /* EXTRA PROPS */
  const insertElement = userInput.insertElement && userInput.destination
  const destination = insertElement ? userInput.destination : {}
  const inTab = userInput.destination.anchorPoint === '<!-- Page tab insertion point -->'

  /* Work out where to copy it */
  let copyToDirectory
  let libPath
  let ownPath
  let pagePath
  let importPath
  let ownHeader

  if (layout === 'element') {
    if (scope === 'global') {
      copyToDirectory = 'src/elements'
      libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    } else {
      copyToDirectory = `${path.dirname(destination.file)}${path.sep}${path.basename(destination.file, '.js')}${path.sep}elements`
      libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    }
  } else if (layout === 'page') {
    copyToDirectory = `${path.dirname(userInput.destination.file)}${path.sep}${path.basename(userInput.destination.file, '.js')}${path.sep}elements`
    libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'
    ownPath = true
    pagePath = `${userInput.destination.pagePath }${userInput.subPath}`
    importPath = `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${newElementInfo.name}.js`
    ownHeader = false
  } else if (layout === 'root-page') {
    copyToDirectory = 'src/pages'
    libPath = '../lib'
    ownPath = true
    pagePath = userInput.pagePath || `/${userInput.elementName}`
    importPath = ''
    ownHeader = true
  }

  let title
  let menuTitle
  let uncommentedStaticImport
  let notInDrawer
  if (layout === 'root-page') {
    title = userInput.elementTitle
    menuTitle = userInput.elementMenuTitle
    uncommentedStaticImport = userInput.uncommentedStaticImport
    notInDrawer = userInput.notInDrawer
  }

  /* RETURN THE RESULT OBJECT */
  config.vars.newElementInfo = {
    type,
    baseClass,
    baseMixin,
    libPath,
    ownPath,
    pagePath,
    ownHeader,
    name,
    nameNoPrefix,
    copyToDirectory,
    store,

    insertElement,
    destination,
    inTab,
    importPath,

    /* add/edit elements */
    fieldElements,

    /* Root pages */
    title,
    menuTitle,
    uncommentedStaticImport,
    notInDrawer
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
