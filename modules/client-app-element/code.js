const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

function destinationElement (config, answers) {
  return utils.prompt({
    type: 'select',
    message: 'Containing element?',
    choices: availableDestinations(config, answers)
  })
}

function availableDestinations (config, answers, keepContents = false) {
  const allStackClasses = ['PageStackElement', 'PageStackListLoadingElement', 'PageStackSingleLoadingElement']
  const allClasses = ['PageStackElement', 'PagePlainElement', 'PageStackListLoadingElement', 'PageStackSingleLoadingElement', 'PageViewElement', 'PageEditElement', 'PageAddElement', 'PageListElement', 'ViewElement', 'PlainElement', 'AddElement', 'EditElement', 'ListElement']

  const classes = {
    PageStackElement: ['PageStackElement'],
    PagePlainElement: allStackClasses,
    PageStackListLoadingElement: ['PageStackSingleLoadingElement'],
    PageStackSingleLoadingElement: ['PageStackListLoadingElement'],
    PageViewElement: ['PageStackSingleLoadingElement'],
    PageEditElement: ['PageStackSingleLoadingElement'],
    PageAddElement: ['PageStackListLoadingElement'],
    PageListElement: ['PageStackListLoadingElement'],
    ViewElement: allClasses,
    PlainElement: allClasses,
    AddElement: allClasses,
    EditElement: allClasses,
    ListElement: allClasses
  }[answers.elementClass]

  /*
    * PageStackElement (NS) can only go into another PageStackElement (./my-parent-stack-element/) or main page (/src/pages)
    * PageStackSingleLoading can only go into a PageStackListLoading (./my-parent-stack-element/)
    * PageStackListLoading can only go into a PageStackSingleLoading (./my-parent-stack-element/) or main page (/src/pages)

    * PagePlainElement(NS)  can go in any *StackElement (./my-parent-stack-element/) or main page (/src/pages)
    * PageEditElement can only go in a PageStackSingleLoadingElement (./my-parent-stack-element/)
    * PageViewElement can only go in a PageStackSingleLoadingElement (./my-parent-stack-element/)
    * PageAddElement can only go in a PageStackListLoadingElement (./my-parent-stack-element/)
    * PageListElement can only go in a PageStackListLoadingElement (./my-parent-stack-element/)

    * Non-page elements:
    * PlainElement (NS) ]
    * AddElement        |
    * EditElement       can go in any element (page or not), placed either in /src/elements or./my-parent-element/elements
    * ViewElement       |
    * ListElement       ]
  */
 debugger
  const matches = utils
    .getFiles(config, info => classes.includes(info.baseClass))
    .map(o => ({ ...o, title: o.file, value: o.file }))

  // Add the main page for specific elements that CAN go there
  if (['PageStackElement', 'PageStackListLoadingElement', 'PagePlainElement'].includes(answers.elementClass)) {
    const file = `src/${config.vars.appFile}.js`
    matches.push({
      title: file,
      file,
      value: `src/${config.vars.appFile}.js`,
      info: {},
      mainAppPage: true
    })
  }

  return matches
}

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

const elementIsPage = (type) => ['root-page', 'page'].includes(type)

exports.getPrompts = async (config) => {
  const answers = {}

  const availableStores = utils.getFiles(config, info => info.storeName)
  const storesModuleInstalled = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  const storesAvailable = storesModuleInstalled && availableStores.length
  const noStoresAvailableMessage = availableStores.length ? '' : ' (No stores available yet)'

  // const toHumanName = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('').replace(/-/g, ' ')}`

  /*
QUESTIONS:

PLACEMENTS:

* Page elements:
  * PageStackElement (NS) can only go into another PageStackElement (./my-parent-stack-element/) or main page (/src/pages)
  * PageStackSingleLoading can only go into a PageStackListLoading (./my-parent-stack-element/)
  * PageStackListLoading can only go into a PageStackSingleLoading (./my-parent-stack-element/) or main page (/src/pages)

  * PagePlainElement(NS)  can go in any *StackElement (./my-parent-stack-element/) or main page (/src/pages)
  * PageEditElement can only go in a PageStackSingleLoadingElement (./my-parent-stack-element/)
  * PageViewElement can only go in a PageStackSingleLoadingElement (./my-parent-stack-element/)
  * PageAddElement can only go in a PageStackListLoadingElement (./my-parent-stack-element/)
  * PageListElement can only go in a PageStackListLoadingElement (./my-parent-stack-element/)

* Non-page elements:
  * PlainElement (NS) ]
  * AddElement        |
  * EditElement       can go in any element (page or not), placed either in /src/elements or./my-parent-element/elements
  * ViewElement       |
  * ListElement       ]

*/

  answers.isPage = await utils.prompt({
    type: 'confirm',
    message: 'Is it a page rather than a simple element?',
    initial: true
  })

  if (answers.isPage) {
    //
    answers.typeOfPage = await utils.prompt({
      type: 'select',
      message: 'What kind of page is it?',
      choices: [
        {
          title: 'A stack. A page which is able to contain other pages',
          description: 'Used to create a page which will contain routed to sub-pages',
          value: 'stack'
        },
        {
          title: 'A plain page. Its route will not be able to contain sub-routes',
          value: 'plain'
        }
      ]
    })

    if (answers.typeOfPage === 'stack') {
      let choices = [
        // Plain stack
        {
          title: 'PageStackElement',
          description: `A simple stack, for non-data pages. Can contain subroutes. E.g. /faq.${noStoresAvailableMessage}`,
          value: 'PageStackElement'
        }
      ]

      if (storesAvailable) {
        choices = [
          ...choices,
          // Loading stack
          {
            title: 'PageStackListLoadingElement',
            description: 'A stack element which will load a list from a server store. E.g. /people',
            value: 'PageStackListLoadingElement'
          },

          // Loading stack
          {
            title: 'PageStackSingleLoadingElement',
            description: 'A stack element which will load a single value from a server store. E.g. /people/:personId',
            value: 'PageStackSingleLoadingElement'
          }
        ]
      }

      answers.elementClass = await utils.prompt({
        type: 'select',
        message: 'What type of stack is it?',
        choices
      })

      const destination = await destinationElement(config, answers)
      answers.destinationFile = destination.file
      //
    } else {
      let choices = [
        // Plain page
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
            description: 'A record-adding page, contained in a PageStackListLoadingElement stack',
            value: 'PageAddElement'
          },

          // Store Page
          {
            title: 'PageListElement',
            description: 'A record-listing page, contained in a PageStackListLoadingElement stack',
            value: 'PageListElement'
          },

          // Store Page
          {
            title: 'PageEditElement',
            description: 'A record-editing page, contained in a PageStackSingleLoadingElement stack',
            value: 'PageAddElement'
          },

          // Store Page
          {
            title: 'PageViewElement',
            description: 'A record-viewing page, contained in a PageStackSingleLoadingElement stack',
            value: 'PageViewElement'
          }
        ]
      }

      answers.elementClass = await utils.prompt({
        type: 'select',
        message: 'What type of page is it?',
        choices
      })

      const destination = await destinationElement(config, answers)
      answers.destinationFile = destination.file
      answers.mainAppPage = destination.mainAppPage

      // These are very likely to be main elements
      if (['PageEditElement', 'PageViewElement', 'PageListElement'].includes(answers.elementClass)) {
        //
        // TODO: Add IF to check that there is not already a main element for the child.
        // This can easily be done by looking for an element with the same path as the parent
        // that is NOT a stack
        answers.isMainElement = await utils.prompt({
          type: 'confirm',
          message: 'Is this element the main one (displayed by default) of the destination stack? (URLs will match)',
          initial: true
        })
      } else {
        answers.isMainElement = false
      }

      if (!answers.isMainElement) {
        answers.subPath = await utils.prompt({
          type: 'text',
          name: 'subPath',
          message: `Nested URL, coming from ${destination.info.pagePath}`,
          validate: (value) => {
            return utils.pagePathValidator(config, value, destination.info.pagePath)
          }
        })
      }
    }

    // Page-specific questions
    answers.elementTitle = await utils.prompt({
      type: 'text',
      name: 'value',
      message: 'Page title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    answers.elementMenuTitle = await utils.prompt({
      type: 'text',
      name: 'value',
      message: 'Page menu title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    })

    if (config.userInput['client-app-frame'].dynamicLoading) { // TODO: Only for root pages
      answers.uncommentedStaticImport = await utils.prompt({
        type: 'toggle',
        name: 'value',
        message: 'Force static load with static import, even though app supports dynamic imports',
        initial: false
      })
    } else {
      answers.uncommentedStaticImport = true
    }
  // NOT a page...
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

    const destination = await destinationElement(config, answers)
    answers.destinationFile = destination.file
  }

  answers.elementName = await utils.prompt({
    type: 'text',
    message: 'Element name',
    initial: '',
    validate: (elementName) => {
      return utils.elementNameValidator(config, answers.elementClass, elementName)
    }
  })

  // List stacks are the only way to "initiate" a store,
  // since single stacks will always inherit it from the parent list.
  // So, if elementClass === PageStackListLoadingElement,
  // ask which store or allow creating one
  // Even PageStackSingleLoadingElement will inherit the store from the list
  if (answers.elementClass === 'PageStackListLoadingElement') {
    answers.storeFile = await utils.prompt({
      type: 'select',
      message: 'Which store will this loading stack get its data from?',
      choices: availableStores
    })
  }

  return answers
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
exports.postPrompts = async (config, answers) => {
  //
  const newElementInfo = {}

  // COMMON PROPS
  const type = answers.type
  const scope = answers.scope
  const storeFile = answers.storeFile
  const elementName = utils.elementNameFromInput(answers.baseClass, answers.elementName)
  const baseClass = answers.baseClass
  const name = `${config.vars.elPrefix}-${elementName}`
  const nameNoPrefix = elementName

  // const fieldElements = utils.fieldElements(type, config, answers, store)

  if (answers.isPage) {
    if (answers.typeOfPage === 'stack') {
      // answers.elementClass: 'pageStackElement', 'PageStackListLoadingElement' or 'PageStackSingleLoadingElement'
      // answers.destinationFile
      // answers.mainAppPage
      // TODO: set a store name, or create one, in PROMPT code above and get that store's info here
      //
    } else { // answers.typeOfPage === 'stack'
      // answers.elementClass: 'PagePlainElement', 'PageAddElement', 'PageListElement', 'PageEditElement', 'PageViewElement'
      // answers.destinationFile
      // answers.mainAppPage (bool)
      // answers.isMainElement (bool)
      // answers.subPath
      // answers.elementTitle, answers.elementMenuTitle, answers.uncommentedStaticImport
      // TODO: get store from the destination, and set it here
    }
  } else {
    // elementClass: 'PlainElement', 'AddElement', 'ListElement', 'EditElement', 'ViewElement',
    // answers.destinationFile
    // TODO: set a store name, or create one, in PROMPT code above and get that store's info here
  }

  // EXTRA PROPS
  const insertElement = answers.insertElement && answers.destination

  // Work out where to copy it
  let copyToDirectory
  let libPath
  let ownPath
  let pagePath
  let subPath
  let importPath
  let ownHeader
  let destination
  let newElementFile

  if (!elementIsPage(answers.type)) {
    if (scope === 'global') {
      destination = insertElement ? answers.destination : {}
      copyToDirectory = `src${path.sep}elements`
      newElementFile = `root-page${copyToDirectory}${path.sep}${name}.js`
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
    ownPath = true
    pagePath = `${answers.destination.pagePath}${answers.subPath}`
    subPath = answers.subPath
    importPath = `./${path.basename(answers.destination.file, '.js')}${path.sep}elements${path.sep}${name}.js`
    ownHeader = false
  } else if (type === 'root-page') {
    destination = { file: `src${path.sep}${config.vars.appFile}.js` }
    copyToDirectory = `src${path.sep}pages`
    newElementFile = `${copyToDirectory}${path.sep}${name}.js`
    libPath = `..${path.sep}lib`
    ownPath = true
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

  // RETURN THE RESULT OBJECT
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

    // add/edit elements
    fieldElements,

    // Root pages
    title,
    menuTitle,
    uncommentedStaticImport,
    notInDrawer
  }
}

exports.postAdd = (config) => {
  // Check answers to adding full add/view/edit if adding PageStackListLoadingElement
  // Check answers to adding full view/edit (and which default) if adding PageStackSingleLoadingElement

}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'PREFIX-ELEMENTNAME.ejs':
      return `${config.vars.newElementInfo.copyToDirectory}/${config.vars.newElementInfo.name}.js`
    default:
      return file
  }
}
