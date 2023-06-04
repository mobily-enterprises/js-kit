const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')
const prompts = require('prompts')

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
- newElementInfo.importPath
*/
exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-element']

  // Element extra questions
  if (userInput.type === 'element') {
    userInput.insertElement = (await prompts({
      type: 'confirm',
      name: 'insertElement',
      message: 'Would you like to place the element somewhere?',
      initial: true
    })).value

    if (userInput.insertElement) {
      userInput.destination = (await prompts({
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
      })).value
    }
  }

  if (userInput.type === 'root-page') {
    //
    userInput.elementTitle = (await prompts({
      type: 'text',
      name: 'value',
      message: 'Page title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })).value

    userInput.elementMenuTitle = (await prompts({
      type: 'text',
      name: 'value',
      message: 'Page menu title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })).value

    if (config.userInput['client-app-frame'].dynamicLoading) {
      userInput.uncommentedStaticImport = (await prompts({
        type: 'toggle',
        name: 'value',
        message: 'Force static load with static import, even though app supports dynamic imports',
        initial: false
      })).value
    } else {
      userInput.uncommentedStaticImport = true
    }
  }

  if (userInput.type === 'page') {
    userInput.destination = (await prompts({
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
    })).value

    userInput.subPath = (await prompts({
      type: 'text',
      name: 'subPath',
      message: `Nested URL, coming from ${userInput.destination.pagePath}`,
      validate: (value) => {
        return utils.pagePathValidator(config, value, userInput.destination.pagePath)
      }
    })).value
  }

  // Store questions (for non-plain elements)
  const type = userInput.type || 'plain'
  let store = null
  if (type !== 'plain') {
    store = await utils.askStoreQuestions(config)
  }

  /* COMMON PROPS */
  const layout = userInput.layout
  const scope = userInput.scope
  userInput.elementName = utils.elementNameFromInput(userInput.elementName, userInput.type)
  const baseClass = utils.elementBaseClass(type)
  const baseMixin = utils.elementBaseMixin(type, layout)

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

  if (layout === 'element') {
    if (scope === 'global') {
      destination = insertElement ? userInput.destination : {}
      copyToDirectory = 'src/elements'
      newElementFile = `${copyToDirectory}/${name}.js`
      libPath = path.relative(`${destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    } else {
      destination = insertElement ? userInput.destination : {}
      copyToDirectory = `${path.dirname(destination.file)}${path.sep}${path.basename(destination.file, '.js')}${path.sep}elements`
      newElementFile = `${copyToDirectory}/${name}.js`
      libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    }
  } else if (layout === 'page') {
    destination = userInput.destination
    copyToDirectory = `${path.dirname(userInput.destination.file)}${path.sep}${path.basename(userInput.destination.file, '.js')}${path.sep}elements`
    newElementFile = `${copyToDirectory}/${name}.js`
    libPath = path.relative(`${userInput.destination.file}/elements`, 'src/lib') || '.'
    ownPath = true
    pagePath = `${userInput.destination.pagePath}${userInput.subPath}`
    subPath = userInput.subPath
    importPath = `./${path.basename(userInput.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js`
    ownHeader = false
  } else if (layout === 'root-page') {
    destination = config.vars.appFile
    copyToDirectory = 'src/pages'
    newElementFile = `${copyToDirectory}/${name}.js`
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
    layout,
    baseClass,
    baseMixin,
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
