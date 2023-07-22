const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

function destinationElement (config, answers) {
  return utils.prompt({
    type: 'select',
    message: 'Containing element?',
    choices: utils
      .getFiles(config, info => info.hasRender)
      .map(o => ({ ...o, title: o.file, value: o.file }))
  })
}

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}

  const availableStores = utils.getFiles(config, info => info.storeName)
  const storesModuleInstalled = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  const storesAvailable = storesModuleInstalled && availableStores.length
  const noStoresAvailableMessage = availableStores.length ? '' : ' (No stores available yet)'

  const isPage = await utils.prompt({
    type: 'confirm',
    message: 'Is it a page rather than a simple element?',
    initial: true
  })

  if (isPage) {
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

    answers.elementTitle = await utils.prompt({
      type: 'text',
      message: 'Page title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    answers.elementMenuTitle = await utils.prompt({
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

    answers.scope = await utils.prompt({
      type: 'select',
      message: 'Where do you want to place the element?',
      choices: [
        // Store-bound
        {
          title: 'Global scope',
          description: 'The element will be placed in the app\'s `elements` directory',
          value: 'global'
        },
        // Store-bound
        {
          title: 'Local scope',
          description: 'The element will be placed in a folder named after the containing element',
          value: 'global'
        }
      ]
    })

    const insertElement = await utils.prompt({
      type: 'confirm',
      message: 'Do you want to place this element somewhere immediately?',
      initial: true
    })

    if (insertElement) {
      const destination = await destinationElement(config, answers)
      answers.destinationFile = destination.file
      answers.destinationFileInfo = destination.info
    }
  }

  answers.elementName = await utils.prompt({
    type: 'text',
    message: 'Element name',
    initial: '',
    validate: (elementName) => {
      return utils.elementNameValidator(config, answers.elementClass, elementName)
    }
  })

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
  // Some worked out variables
  const isPage = answers.elementClass.startsWith('Page')

  // API attributes. These are the ones available in the API
  const elementClass = answers.elementClass
  const elementName = utils.elementNameFromInput(answers.elementClass, answers.elementName)
  const destinationFile = answers.destinationFile || '' // Not necessarily there, Plain elements might not be copied over
  const destinationFileInfo = answers.destinationFileInfo || null // Not necessarity available (e.g. if used via API)
  const inDrawer = !!answers.inDrawer // Pages (root ones) only
  const uncommentedStaticImport = !!answers.uncommentedStaticImport // Pages (root ones) only
  const storeFile = answers.storeFile || '' // Page(Edit|View|List)Element only. The store's file
  const title = !isPage ? '' : (answers.elementTitle || '') // Pages only
  const menuTitle = !isPage ? '' : (answers.elementMenuTitle || '') // Pages only
  const tailEnd = !!answers.tailEnd // Not asked interactively, but usable if adding element programmatically
  const scope = answers.scope || ''
  const pagePath = answers.pagePath || ''

  // More worked out variables
  const nameWithPrefix = `${config.vars.elPrefix}-${elementName}`
  const nameNoPrefix = elementName

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

  if (isPage) {
    copyToDirectory = `src${path.sep}pages`
    newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
    libPath = `..${path.sep}lib`
    importPath = `.${path.sep}pages${path.sep}${nameWithPrefix}.js`
  } else {
    if (scope === 'global') {
      copyToDirectory = `src${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destinationFile}/elements`, 'src/lib') || '.'
      if (answers.destinationFile) importPath = `.${path.sep}${path.basename(answers.destinationFile, '.js')}${path.sep}elements${path.sep}${nameWithPrefix}.js`
    } else {
      copyToDirectory = `${path.dirname(destinationFile)}${path.sep}${path.basename(answers.destinationFile, '.js')}${path.sep}`
      newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destinationFile}${path.sep}`, 'src/lib') || '.'
      if (answers.destinationFile) importPath = `.${path.sep}${path.basename(answers.destinationFile, '.js')}${path.sep}${nameWithPrefix}.js`
    }
  }

  // RETURN THE RESULT OBJECT
  config.vars.newElementInfo = {

    isPage,

    // API
    elementClass,
    elementName,
    destinationFile,
    destinationFileInfo,
    inDrawer,
    uncommentedStaticImport,
    storeFile,
    title,
    menuTitle,
    scope,
    tailEnd,
    pagePath,
    // END OF API

    storeFileInfo,

    nameWithPrefix,
    nameNoPrefix,

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
      copyToDirectory = `src${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${name}.js`
      libPath = path.relative(`${destination.file}/elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(answers.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    } else {
      destination = insertElement ? answers.destination : {}
      copyToDirectory = `${path.dirname(destination.file)}${path.sep}${path.basename(destination.file, '.js')}${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${name}.js`
      libPath = path.relative(`${answers.destination.file}${path.sep}elements`, 'src/lib') || '.'
      ownPath = false
      pagePath = ''
      importPath = insertElement ? `./${path.basename(answers.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js` : ''
      ownHeader = false
    }
  } else if (type === 'page') {
    destination = answers.destination
    copyToDirectory = `${path.dirname(answers.destination.file)}${path.sep}${path.basename(answers.destination.file, '.js')}${path.sep}elements`
    newElementFile = `${copyToDirectory}${path.sep}${name}.js`
    libPath = path.relative(`${answers.destination.file}${path.sep}elements`, `src${path.sep}lib`) || '.'
    pagePath = `${answers.destination.pagePath}${answers.subPath}`
    subPath = answers.subPath
    importPath = `./${path.basename(answers.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js`
    ownHeader = false
  } else if (type === 'root-page') {
    destination = { file: `src${path.sep}${config.vars.appFile}.js` }
    copyToDirectory = `src${path.sep}pages`
    newElementFile = `${copyToDirectory}${path.sep}${name}.js`
    libPath = `..${path.sep}lib`
    pagePath = typeof answers.pagePath === 'undefined' ? `${path.sep}${elementName}` : answers.pagePath
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
      copyToDirectory = `src${path.sep}pages`
      newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
      libPath = `..${path.sep}lib`
      importPath = `.${path.sep}pages${path.sep}${nameWithPrefix}.js`
      pagePath = `/${answers.subPath}`
      //
    } else {
      copyToDirectory = `${path.dirname(answers.destinationFile)}${path.sep}${path.basename(answers.destinationFile, '.js')}${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destinationFile}${path.sep}elements`, `src${path.sep}lib`) || '.'
      pagePath = isMainElement ? answers.destinationFileInfo.pagePath : `${answers.destinationFileInfo.pagePath}${answers.subPath}`
      subPath = answers.subPath
      importPath = `./${path.basename(answers.destinationFile, '.js')}${path.sep}elements${path.sep}${nameWithPrefix}.js`
    }
  } else {
    if (scope === 'global') {
      copyToDirectory = `src${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destinationFile}/elements`, 'src/lib') || '.'
      if (answers.destinationFile) importPath = `.${path.sep}${path.basename(answers.destinationFile, '.js')}${path.sep}elements${path.sep}${nameWithPrefix}.js`
    } else {
      copyToDirectory = `${path.dirname(destinationFile)}${path.sep}${path.basename(answers.destinationFile, '.js')}${path.sep}elements`
      newElementFile = `${copyToDirectory}${path.sep}${nameWithPrefix}.js`
      libPath = path.relative(`${answers.destination.file}${path.sep}elements`, 'src/lib') || '.'
      if (answers.destinationFile) importPath = `.${path.sep}${path.basename(answers.destination.file, '.js')}${path.sep}elements${path.sep}${nameWithPrefix}.js`
    }
  }

*/
