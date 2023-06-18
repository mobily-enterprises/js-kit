const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

const elementIsPage = (type) => ['root-page', 'page'].includes(type)

exports.getPrompts = async (config) => {
  const answers = {}

  const storesAvailable = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  // const toHumanName = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('').replace(/-/g, ' ')}`

  /*
QUESTIONS:

Q: Is it a page?
A: Yes
  Q1: Is it a stack?
  A1: Yes
    Q: Pick PageStackElement -- PageStackListLoadingElement PageStackSingleLoadingElement
    A: ***CHOICE***
    Q: Where?
    A: ***POSITION***
  A1: No
    Q: PagePlainElement -- PageAddElement PageEditElement PageViewElement PageListElement
    A: ***CHOICE***
    Q: Where?
    A: ***POSITION***

  Q2: Page-specific questions
  A2: ***PAGE ANSWERS***

A: No (not a page)
    Q: Pick PlainElement -- AddElement EditElement ViewElement ListElement
    A: ***CHOICE***
    Q: Where?
    A: ***POSITION***
    Q: General purpose or element specific?
    A: ***GENERAL***

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

PLAIN PAGES:
------------

IF PageStackElement:
   What is the Destination element? (Root page, or another PageStackElement)
   (File placement automatic: /src/pages if destination is root page, or under ./my-parent-stack-element/ if destination is an PageStackElement )

IF PlainElement:
   What is the Destination element? (Any element type)
   File placement: Choose: "General /elements directory | Within the Destination element's domain"
     (
      Placement automatic:
         General: /src/elements
         Specific: ./my-parent-element/elements
      )

IF PagePlainElement:
  What is the Destination element? (Root page, Any Stack element)
  (File placement automatic: /src/pages if destination is root page, or under ./my-parent-stack-element/ if destination is an PageStackElement )

STORE/LOADER PAGES:
-------------------

IF PageStackListLoadingElement
  What is the destination element? (Root page, or a PageStackSingleLoadingElement)
  (File placement automatic: /src/pages if destination is root page, or under ./my-parent-stack-element/ if destination is an PageStackSingleLoadingElement )

IF PageStackSingleLoadingElement
  What is the destination element? (Any PageStackListLoadingElement)
  (File placement automatic: ./my-parent-stack-element/)

IF View/Edit Element
  What is the destination element? (Any Element type)
   File placement: Choose: "General /elements directory | Within the Destination element's domain"
     (
      Placement automatic:
         General: /src/elements
         Specific: ./my-parent-element/elements
      )

IF AddElement
  What is the destination element? (Any element type)
   File placement: Choose: "General /elements directory | Within the Destination element's domain"
     (
      Placement automatic:
         General: /src/elements
         Specific: ./my-parent-element/elements
      )

IF ListElement
  What is the destination element? (Any element type)
   File placement: Choose: "General /elements directory | Within the Destination element's domain"
     (
      Placement automatic:
         General: /src/elements
         Specific: ./my-parent-element/elements
      )

IF PageView/Edit Element
  What is the destination element? (Any PageStackSingleLoadingElement)
  (File placement automatic: ./my-parent-stack-element/)

IF PageAddElement
  What is the destination element? (Any PageStackListLoadingElement)
  (File placement automatic: ./my-parent-stack-element/)

IF PageListElement
  What is the destination element? (Any PageStackListLoadingElement)
  (File placement automatic: ./my-parent-stack-element/)

INITIAL WRITEUP:
  NON STORE
    PlainElement (Dest: PlainElement, PagePlainElement, PageStackElement) (Placement: app's /elements or in ./my-parent-element/elements  | ./my-parent-stack-element/elements)
    *PageStackElement (Dest: App, PageStackElement) (Placement: /src/pages, or under ./my-parent-stack-element/)
    PagePlainElement (Dest: PageStackElement) (Placement: always under ./my-parent-stack-element/ )

  STORE
    PageStackListLoadingElement (Dest: App or PageStackSingleLoadingElement) (Placement: /src/pages, or under ./my-parent-stack-single-element/)
    PageStackSingleLoadingElement (Dest: PageStackListLoadingElement) (Placement: ./my-parent-stack-element/elements)
    Page View/Add/Edit Element (Dest: PageStackSingleLoadingElement) (Placement: ./my-parent-stack-element/)
    PageListElement (Dest: PageStackListLoadingElement) (Placement: ./my-parent-stack-list-element/)
*/

  function availableDestinations (config, answers, keepContents = false) {
    const allStackClasses = ['PageStackElement', 'PageStackListLoadingElement', 'PageStackSingleLoadingElement']
    const allClasses = ['PageStackElement', 'PagePlainElement', 'PageStackListLoadingElement', 'PageStackSingleLoadingElement', 'PageViewElement', 'PageEditElement', 'PageAddElement', 'PageListElement', 'ViewElement', 'PlainElement', 'AddElement', 'EditElement', 'ListElement']

    const classes = {
      PageStackElement: 'PageStackElement',
      PagePlainElement: allStackClasses,
      PageStackListLoadingElement: 'PageStackSingleLoadingElement',
      PageStackSingleLoadingElement: 'PageStackListLoadingElement',
      PageViewElement: 'PageStackSingleLoadingElement',
      PageEditElement: 'PageStackSingleLoadingElement',
      PageAddElement: 'PageStackListLoadingElement',
      PageListElement: 'PageStackListLoadingElement',
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
    const matches = utils.findElementsWithClass(config, classes, keepContents)

    // Add the main page for specific elements that CAN go there
    if (['pageStackElement', 'PageStackListLoadingElement', 'PagePlainElement'].includes(answers.elementClass)) {
      matches.push({
        file: `src/${config.vars.appFile}.js`,
        contents: false,
        info: {},
        mainAppPage: true
      })
    }

    return matches
  }

  function destinationElement (config, answers) {
    return utils.prompt({
      type: 'select',
      message: 'Containing element?',
      choices: availableDestinations(config, answers)
    })
  }

  function elementNamePrefix (elementClass) {
    return {
      PageStackElement: 'page-stack-',
      PlainElement: 'plain-',
      PagePlainElement: 'page-plain-',
      PageStackListLoadingElement: 'page-stack-list-',
      PageStackSingleLoadingElement: 'page-stack-single-',
      PageViewElement: 'page-view-',
      PageAddElement: 'page-add-',
      PageEditElement: 'page-edit-',
      PageListElement: 'page-list-',
      ViewElement: 'view-',
      AddElement: 'add-',
      EditElement: 'edit-',
      ListElement: 'list-'
    }[elementClass]
  }

  function elementUrlPrefix (elementClass) {
    return {
      PageStackElement: '',
      PagePlainElement: '',
      PageStackListLoadingElement: 'list-',
      PageStackSingleLoadingElement: '',
      PageViewElement: 'view',
      PageAddElement: 'add',
      PageEditElement: 'edit',
      PageListElement: 'list'
    }[elementClass]
  }

  answers.elementName = await utils.prompt({
    type: 'text',
    message: 'Element name',
    initial: '',
    validate: (value) => {
      return utils.elementNameValidator(config, value)
    }
  })

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
          description: 'A simple stack, for non-data pages. Can contain subroutes. E.g. /faq',
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

      const destination = await destinationElement(answers)
      answers.destinationFile = destination.file

      // List stacks are the only way to "initiate" a store,
      // since single stacks will always inherit it from the parent list.
      // So, if elementClass === PageStackListLoadingElement,
      // ask which store or allow creating one
      if (answers.elementClass === 'PageStackListLoadingElement') {
        const store = await utils.askStoreQuestions(config)
        answers.store = store.storeName
      }
      //
    } else {
      let choices = [
        // Plain page
        {
          title: 'PagePlainElement',
          description: 'A simple page, for non-data pages. Cannot contain subroutes.',
          value: 'PagePlainElement'
        }
      ]

      if (storesAvailable) {
        choices = [
          ...choices,
          // Stack page
          {
            title: 'PageAddElement',
            description: 'A record-adding page, contained in a PageStackListLoadingElement stack',
            value: 'PageAddElement'
          },

          // Stack page
          {
            title: 'PageListElement',
            description: 'A record-listing page, contained in a PageStackListLoadingElement stack',
            value: 'PageListElement'
          },

          // Stack page
          {
            title: 'PageEditElement',
            description: 'A record-editing page, contained in a PageStackSingleLoadingElement stack',
            value: 'PageAddElement'
          },

          // Stack page
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

      const destination = await destinationElement(answers)
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
  } else {
    let choices = [
      // Plain page
      {
        title: 'PlainElement',
        description: 'A simple page, for non-data pages. Cannot contain subroutes.',
        value: 'PlainElement'
      }
    ]

    if (storesAvailable) {
      choices = [
        ...choices,
        // Loading stack
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

    const destination = await destinationElement(answers)
    answers.destinationFile = destination.file
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

  // -------------------------------------------------------------------------------
  /*
  //
  const elementBaseClass = (type) => {
    const lookup = {
      plain: 'AppElement',
      edit: 'EditElement',
      list: 'ListElement',
      view: 'ViewElement',
      page: 'PageStackElement',
      'root-page': 'PageStackElement'
    }
    return lookup[type]
  }

  // COMMON PROPS
  const type = answers.type
  const scope = answers.scope
  const store = answers.store
  const elementName = utils.elementNameFromInput(answers.elementName, answers.type)
  const baseClass = elementBaseClass(type)
  const fieldElements = utils.fieldElements(type, config, answers, store)
  const name = `${config.vars.elPrefix}-${elementName}`
  const nameNoPrefix = elementName

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
  */
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
