const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

function destinationElement (config, answers, choices) {
  if (answers.typeOfElement === 'tab-element') {
    return utils.prompt({
      type: 'select',
      message: 'Where would you like to add this tab?',
      choices
    })
  } else {
    return utils.prompt({
      type: 'select',
      message: 'Where would you like to insert this element?',
      choices
    })
  }
}

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}

  const availableStores = utils.getFiles(config, info => info.storeName)
  const storesModuleInstalled = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  const storesAvailable = storesModuleInstalled && availableStores.length
  const noStoresAvailableMessage = availableStores.length ? '' : ' (No stores available yet)'

  answers.typeOfElement = await utils.prompt({
    type: 'select',
    message: 'What type of element are you adding?',
    choices: [
      {
        title: 'A page element (a page with a route)',
        value: 'page'
      },
      {
        title: 'An new tab in a page',
        value: 'tab-element'
      },
      {
        title: 'A general purpose element, to be copied in the `elements` directory',
        value: 'general-element'
      },
      {
        title: 'A page-specific element, to be copied in a folder named after the page',
        value: 'page-specific'
      }
    ]
  })

  if (answers.typeOfElement === 'general-element' || answers.typeOfElement === 'page-specific') {
    answers.insertElement = await utils.prompt({
      type: 'confirm',
      message: 'Do you want to insert this element in another element\'s body automatically?',
      initial: true
    })
  }

  if (answers.insertElement || answers.typeOfElement === 'tab-element') {
    let choices
    if (answers.typeOfElement === 'tab-element') {
      choices = utils
        .getFiles(config, info => info.hasTabs && typeof info.pagePath !== 'undefined')
        .map(o => ({ ...o, title: o.file, value: o }))
    } else {
      choices = utils
        .getFiles(config, info => info.hasContents)
        .map(o => ({ ...o, title: o.file, value: o }))
    }
    if (choices.length) {
      const destination = await destinationElement(config, answers, choices)
      answers.destinationFile = destination.file
      answers.destinationFileInfo = destination.info
    } else {
      console.error('No available destinations, aborting...')
      process.exit(1)
    }
  }

  if (answers.typeOfElement === 'page') {
    let choices = [
      // Plain page (page)
      {
        title: 'PagePlainElement',
        description: `A simple page, for non-data pages. Cannot contain subroutes.${noStoresAvailableMessage}`,
        value: 'PagePlainElement'
      }
    ]

    if (storesAvailable) {
      choices = [
        ...choices,
        // Store Page
        {
          title: 'PageAddElement',
          description: 'A record-adding page',
          value: 'PageAddElement'
        },

        // Store Page
        {
          title: 'PageListElement',
          description: 'A record-listing page',
          value: 'PageListElement'
        },

        // Store Page
        {
          title: 'PageEditElement',
          description: 'A record-editing page',
          value: 'PageAddElement'
        },

        // Store Page
        {
          title: 'PageViewElement',
          description: 'A record-viewing page',
          value: 'PageViewElement'
        }
      ]
    }

    answers.elementClass = await utils.prompt({
      type: 'select',
      message: 'What type of page is it?',
      choices
    })

    answers.pagePath = await utils.prompt({
      type: 'text',
      message: 'Page URL',
      validate: (value) => {
        return utils.pagePathValidator(config, value)
      }
    })

    answers.title = await utils.prompt({
      type: 'text',
      message: 'Page title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    answers.menuTitle = await utils.prompt({
      type: 'text',
      message: 'Page menu title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    if (answers.pagePath.indexOf(':') === -1) {
      answers.inDrawer = await utils.prompt({
        type: 'confirm',
        message: 'Do you want to place the element in the drawer?',
        initial: true
      })
    }

    if (config.userInput['client-app-frame'].dynamicLoading) {
      answers.uncommentedStaticImport = await utils.prompt({
        type: 'toggle',
        message: 'Force static load with static import, even though app supports dynamic imports',
        initial: false
      })
    } else {
      answers.uncommentedStaticImport = true
    }
  //
  // NOT a page...
  //
  } else {
    let choices = [
      // Plain Element
      {
        title: 'PlainElement',
        description: `A simple page, for non-data pages. Cannot contain subroutes.${noStoresAvailableMessage}`,
        value: 'PlainElement'
      }
    ]

    if (storesAvailable) {
      choices = [
        ...choices,
        // Store-bound
        {
          title: 'AddElement',
          description: 'A record-adding element, stand-alone, not a page',
          value: 'PageAddElement'
        },

        // Store-bound
        {
          title: 'ListElement',
          description: 'A record-listing element, stand-alone, not a page',
          value: 'ListElement'
        },

        // Store-bound
        {
          title: 'EditElement',
          description: 'A record-editing element, stand-alone, not a page',
          value: 'AddElement'
        },

        // Store-bound
        {
          title: 'ViewElement',
          description: 'A record-viewing element, stand-alone, not a page',
          value: 'ViewElement'
        }
      ]
    }

    answers.elementClass = await utils.prompt({
      type: 'select',
      message: 'What type of element is it?',
      choices
    })

    answers.elementName = await utils.prompt({
      type: 'text',
      message: 'Element name',
      initial: '',
      validate: (elementName) => {
        return utils.elementNameValidator(config, answers.elementClass, elementName)
      }
    })
  }

  if (!(answers.elementClass.endsWith('PlainElement'))) {
    answers.storeFile = await utils.prompt({
      type: 'select',
      message: 'Which store will this element get its data from?',
      choices: availableStores
    })
  }

  return answers
}

exports.postPrompts = async (config, answers) => {
  //
  // API attributes. These are the ones available in the API
  const elementClass = answers.elementClass
  const typeOfElement = answers.typeOfElement
  const elementName = typeOfElement === 'page' ? utils.elementNameFromPagePath(config, answers.pagePath) : utils.elementNameFromInput(answers.elementClass, answers.elementName)
  const destinationFile = answers.destinationFile || '' // Not necessarily there, Plain elements might not be copied over
  const destinationFileInfo = answers.destinationFileInfo || null // Not necessarity available (e.g. if used via API)
  const inDrawer = !!answers.inDrawer // Pages (root ones) only
  const uncommentedStaticImport = !!answers.uncommentedStaticImport // Pages (root ones) only
  const storeFile = answers.storeFile || '' // Page(Edit|View|List)Element only. The store's file
  const title = typeOfElement !== 'page' ? '' : (answers.title || '') // Pages only
  const menuTitle = typeOfElement !== 'page' ? '' : (answers.menuTitle || '') // Pages only
  const tailEnd = !!answers.tailEnd // Not asked interactively, but usable if adding element programmatically
  const filePosition = answers.filePosition || ''
  const pagePath = answers.pagePath || ''
  const insertElement = answers.insertElement || false

  // More worked out variables
  const nameWithPrefix = `${config.vars.elPrefix}-${elementName}`
  const nameNoPrefix = elementName
  const willNeedToInsertElement = typeOfElement === 'tab-element' || insertElement

  if (typeOfElement === 'tab-element' && !destinationFile) {
    console.error('Destination file is mandatory for tabs')
    process.exit(1)
  }

  if (destinationFile && !destinationFileInfo) {
    answers.destinationFileInfo = config.scaffoldizerUtils.fileToInfo(destinationFile)
  }

  let storeFileInfo = null
  if (answers.storeFile) {
    storeFileInfo = require(path.resolve(path.join(config.dstDir, storeFile)))
  }

  let copyToDirectory = '' // Req
  let newElementFile = '' // Req
  let libPath = '' // Req
  let importPath = '' //  Req for pages

  switch (answers.typeOfElement) {
    case 'page':
      copyToDirectory = 'src/pages'
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = '../lib'
      importPath = `./pages/${nameWithPrefix}.js`
      break

    case 'general-element':
      copyToDirectory = 'src/elements'
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = '../lib'
      importPath = `./${path.relative(path.dirname(destinationFile), newElementFile)}`
      break

    case 'tab-element':
    case 'page-specific':
      copyToDirectory = `${path.dirname(destinationFile)}/${path.basename(answers.destinationFile, '.js')}`
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = `./${path.relative(path.dirname(newElementFile), 'src/lib')}`
      importPath = `./${path.relative(path.dirname(destinationFile), newElementFile)}`
      break
  }

  // RETURN THE RESULT OBJECT
  config.vars.newElementInfo = {

    // API
    typeOfElement,
    elementClass,
    elementName,
    destinationFile,
    destinationFileInfo,
    inDrawer,
    uncommentedStaticImport,
    storeFile,
    title,
    menuTitle,
    filePosition,
    tailEnd,
    pagePath,
    insertElement,
    // END OF API

    storeFileInfo,

    nameWithPrefix,
    nameNoPrefix,
    willNeedToInsertElement,

    copyToDirectory,
    newElementFile,
    libPath,
    importPath
  }
}

exports.postAdd = (config) => {
  // TODO: Check answers to adding full view/edit (and which default) if adding PageViewElement
}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'PREFIX-ELEMENTNAME.ejs':
      // return config.vars.newElementFile // `${config.vars.newElementInfo.copyToDirectory}/${config.vars.newElementInfo.nameWithPrefix}.js`
      return `${config.vars.newElementInfo.copyToDirectory}/${config.vars.newElementInfo.nameWithPrefix}.js`

    default:
      return file
  }
}
// Work out where to copy it
/*
  if (!elementIsPage(answers.type)) {
    if (scope === 'global') {
      destination = insertElement ? answers.destination : {}
      copyToDirectory = `src/elements`
      newElementFile = `${copyToDirectory}/${name}.js`
      libPath = path.relative(`${destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(answers.destination.file, '.js')}/elements/${name}.js` : ''
      ownHeader = false
    } else {
      destination = insertElement ? answers.destination : {}
      copyToDirectory = `${path.dirname(destination.file)}/${path.basename(destination.file, '.js')}/elements`
      newElementFile = `${copyToDirectory}/${name}.js`
      libPath = path.relative(`${answers.destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(answers.destination.file, '.js')}/elements/${name}.js` : ''
      ownHeader = false
    }
  } else if (type === 'page') {
    destination = answers.destination
    copyToDirectory = `${path.dirname(answers.destination.file)}/${path.basename(answers.destination.file, '.js')}/elements`
    newElementFile = `${copyToDirectory}/${name}.js`
    libPath = path.relative(`${answers.destination.file}/elements`, `src/lib`) || '.'
    pagePath = `${answers.destination.pagePath}${answers.subPath}`
    subPath = answers.subPath
    importPath = `./${path.basename(answers.destination.file, '.js')}/elements/${name}.js`
    ownHeader = false
  } else if (type === 'root-page') {
    destination = { file: `src/${config.vars.appFile}.js` }
    copyToDirectory = `src/pages`
    newElementFile = `${copyToDirectory}/${name}.js`
    libPath = `../lib`
    pagePath = typeof answers.pagePath === 'undefined' ? `/${elementName}` : answers.pagePath
    importPath = ''
    ownHeader = true
  }

  let title
  let menuTitle
  let uncommentedStaticImport
  let notInDrawer
  if (type === 'root-page') {
    title = answers.elementTitle
    menuTitle = answers.elementMenuTitle
    uncommentedStaticImport = answers.uncommentedStaticImport
    notInDrawer = answers.notInDrawer
  }

  // THIS USED TO BE FOR SUB-PAGES, SOMETHING I NO LONGER DO
  if (answers.isPage) {
    if (rootPage) {
      copyToDirectory = `src/pages`
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = `../lib`
      importPath = `./pages/${nameWithPrefix}.js`
      pagePath = `/${answers.subPath}`
      //
    } else {
      copyToDirectory = `${path.dirname(answers.destinationFile)}/${path.basename(answers.destinationFile, '.js')}/elements`
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destinationFile}/elements`, `src/lib`) || '.'
      pagePath = isMainElement ? answers.destinationFileInfo.pagePath : `${answers.destinationFileInfo.pagePath}${answers.subPath}`
      subPath = answers.subPath
      importPath = `./${path.basename(answers.destinationFile, '.js')}/elements/${nameWithPrefix}.js`
    }
  } else {
    if (scope === 'global') {
      copyToDirectory = `src/elements`
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destinationFile}/elements`, 'src/lib') || '.'
      if (answers.destinationFile) importPath = `./${path.basename(answers.destinationFile, '.js')}/elements/${nameWithPrefix}.js`
    } else {
      copyToDirectory = `${path.dirname(destinationFile)}/${path.basename(answers.destinationFile, '.js')}/elements`
      newElementFile = `${copyToDirectory}/${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destination.file}/elements`, 'src/lib') || '.'
      if (answers.destinationFile) importPath = `./${path.basename(answers.destination.file, '.js')}/elements/${nameWithPrefix}.js`
    }
  }

*/
