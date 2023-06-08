const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => { }

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
- newElementInfo.importPath
*/
exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-element']

  const storesAvailable = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  const elementBaseClass = (type) => {
    const lookup = {
      plain: 'AppElement',
      edit: 'EditElement',
      list: 'ListElement',
      view: 'ViewElement',
      page: 'AppPageElement',
      'root-page': 'AppRootPageElement'
    }
    return lookup[type]
  }

  const toHumanName = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('').replace(/-/g, ' ')}`

  let typeChoices = [
    {
      title: 'Root page element (for main entry points)',
      value: 'root-page'
    },
    {
      title: 'Page element (for sub-pages, children of main entry points)',
      value: 'page'
    },
    {
      title: 'Plain (plain element)',
      value: 'plain'
    }
  ]
  if (storesAvailable) {
    typeChoices = [...typeChoices,
      {
        title: 'View (to view a record)',
        value: 'view'
      },
      {
        title: 'Edit (to edit a record)',
        value: 'edit'
      },
      {
        title: 'List (to list several records)',
        value: 'list'
      }
    ]
  }

  userInput.type = await utils.prompt({
    type: 'select',
    message: 'Which type of element?',
    choices: typeChoices
  })

  const elementIsPage = userInput.type === 'root-page' || userInput.type === 'page'
  const elementUsesStores = userInput.type === 'view' || userInput.type === 'edit' || userInput.type === 'list'

  userInput.elementName = await utils.prompt({
    type: 'text',
    message: `${toHumanName(userInput.type)} element name`,
    initial: '',
    validate: (value) => {
      return utils.elementNameValidator(config, value)
    }
  })

  if (!elementIsPage) {
    //
    userInput.scope = await utils.prompt({
      type: 'select',
      name: 'value',
      message: "What is the element's scope?",
      choices: [
        {
          title: 'Global. General purposes element used by several pages/elements',
          value: 'global'
        },
        {
          title: 'Specific. A specific element only used, and needed, by another element',
          value: 'specific'
        }
      ]
    })

    userInput.insertElement = await utils.prompt({
      type: 'confirm',
      name: 'insertElement',
      message: 'Would you like to place the element in another element?',
      initial: true
    })

    if (userInput.insertElement) {
      userInput.destination = await utils.prompt({
        type: 'select',
        name: 'destination',
        message: 'Destination element',
        choices: utils.findAnchorPoints(config, ['<!-- Element insertion point -->']).map(e => { return {
          title: `${e.file} -- ${e.info.description} ${utils.humanizeAnchorPoint(e.anchorPoint)}`,
          value: {
            file: e.file,
            anchorPoint: e.anchorPoint
          }
        } })
      })
    }
  }

  if (userInput.type === 'root-page') {
    //
    userInput.elementTitle = await utils.prompt({
      type: 'text',
      name: 'value',
      message: 'Page title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    userInput.elementMenuTitle = await utils.prompt({
      type: 'text',
      name: 'value',
      message: 'Page menu title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    if (config.userInput['client-app-frame'].dynamicLoading) {
      userInput.uncommentedStaticImport = await utils.prompt({
        type: 'toggle',
        name: 'value',
        message: 'Force static load with static import, even though app supports dynamic imports',
        initial: false
      })
    } else {
      userInput.uncommentedStaticImport = true
    }
  }

  if (userInput.type === 'page') {
    //
    userInput.destination = await utils.prompt({
      type: 'select',
      name: 'value',
      message: 'Destination element',
      choices: utils.findAnchorPoints(config, '<!-- Page tab insertion point -->')
        .map(e => { return {
          title: `${e.file} -- ${e.info.description} ${utils.humanizeAnchorPoint(e.anchorPoint)}`,
          value: {
            file: e.file,
            anchorPoint: e.anchorPoint,
            pagePath: e.info.pagePath
          }
        } })
    })

    userInput.subPath = await utils.prompt({
      type: 'text',
      name: 'subPath',
      message: `Nested URL, coming from ${userInput.destination.pagePath}`,
      validate: (value) => {
        return utils.pagePathValidator(config, value, userInput.destination.pagePath)
      }
    })
  }

  // Store questions (for non-plain elements)
  const type = userInput.type
  let store = null
  if (elementUsesStores) {
    store = await utils.askStoreQuestions(config)
  }

  /* COMMON PROPS */
  const scope = userInput.scope
  userInput.elementName = utils.elementNameFromInput(userInput.elementName, userInput.type)
  const baseClass = elementBaseClass(type)

  const fieldElements = utils.fieldElements(type, config, userInput, store)

  const name = `${config.vars.elPrefix}-${userInput.elementName}`
  const nameNoPrefix = userInput.elementName

  /* EXTRA PROPS */
  const insertElement = userInput.insertElement && userInput.destination

  /* Work out where to copy it */
  let copyToDirectory
  let libPath
  let ownPath
  let pagePath
  let subPath
  let importPath
  let ownHeader
  let destination
  let newElementFile

  if (!elementIsPage) {
    if (scope === 'global') {
      destination = insertElement ? userInput.destination : {}
      copyToDirectory = `src${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${name}.js`
      libPath = path.relative(`${destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    } else {
      destination = insertElement ? userInput.destination : {}
      copyToDirectory = `${path.dirname(destination.file)}${path.sep}${path.basename(destination.file, '.js')}${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${name}.js`
      libPath = path.relative(`${userInput.destination.file}${path.sep}elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    }
  } else if (type === 'page') {
    destination = userInput.destination
    copyToDirectory = `${path.dirname(userInput.destination.file)}${path.sep}${path.basename(userInput.destination.file, '.js')}${path.sep}elements`
    newElementFile = `${copyToDirectory}${path.sep}${name}.js`
    libPath = path.relative(`${userInput.destination.file}${path.sep}elements`, `src${path.sep}lib`) || '.'
    ownPath = true
    pagePath = `${userInput.destination.pagePath}${userInput.subPath}`
    subPath = userInput.subPath
    importPath = `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js`
    ownHeader = false
  } else if (type === 'root-page') {
    destination = { file: `src${path.sep}${config.vars.appFile}.js` }
    copyToDirectory = `src${path.sep}pages`
    newElementFile = `${copyToDirectory}${path.sep}${name}.js`
    libPath = `..${path.sep}lib`
    ownPath = true
    pagePath = userInput.pagePath || `${path.sep}${userInput.elementName}`
    importPath = ''
    ownHeader = true
  }

  let title
  let menuTitle
  let uncommentedStaticImport
  let notInDrawer
  if (type === 'root-page') {
    title = userInput.elementTitle
    menuTitle = userInput.elementMenuTitle
    uncommentedStaticImport = userInput.uncommentedStaticImport
    notInDrawer = userInput.notInDrawer
  }

  /* RETURN THE RESULT OBJECT */
  config.vars.newElementInfo = {
    type,
    baseClass,
    libPath,
    ownPath,
    pagePath,
    subPath,
    ownHeader,
    name,
    nameNoPrefix,
    copyToDirectory,
    newElementFile,
    store,
    destination,

    insertElement,
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

exports.postAdd = (config) => {}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'PREFIX-ELEMENTNAME.ejs':
      return `${config.vars.newElementInfo.copyToDirectory}/${config.vars.newElementInfo.name}.js`
    default:
      return file
  }
}
