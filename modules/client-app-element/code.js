const path = require('path')
const utils = require('../../utils.js')
const fs = require('fs')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

const elementIsPage = (type) => ['root-page', 'page'].includes(type)

exports.getPrompts = async (config) => {
  const answers = {}

  const storesAvailable = fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))

  const toHumanName = ([first, ...rest]) => `${first.toUpperCase()}${rest.join('').replace(/-/g, ' ')}`

  /*
    NON STORE
    PlainElement (Dest: PlainElement, PagePlainElement, PageStackElement) (Placement: app's /elements or in ./my-parent-element/elements  | ./my-parent-stack-element/elements)
    *PageStackElement (Dest: App, PageStackElement) (Placement: /src/pages, or under ./my-parent-stack-element/)
    PagePlainElement (Dest: PageStackElement) (Placement: always under ./my-parent-stack-element/ )

    STORE
    PageStackListLoadingElement (Dest: App or PageStackSingleLoadingElement) (Placement: /src/pages, or under ./my-parent-stack-single-element/)
    PageStackSingleLoadingElement (Dest: PageStackListLoadingElement) (Placement: ./my-parent-stack-element/elements)
    Page View/Add/Edit Element (Dest: PageStackSingleLoadingElement) (Placement: ./my-parent-stack-element/)
    PageListElement (Dest: PageStackListLoadingElement) (Placement: ./my-parent-stack-list-element/)

QUESTIONS:

Q: Is it a page?
A: Yes
  Q: Is it a stack?
  A: Yes
    Q: Pick PageStackElement -- PageStackListLoadingElement PageStackSingleLoadingElement
    A: ***CHOICE***
    Q: Where?
    A: ***POSITION***

  A: No
    Q: PagePlainElement -- PageAddElement PageEditElement PageViewElement PageListElement
    A: ***CHOICE***
    Q: Where?
    A: ***POSITION***

A: No (not a page)
    Q: Pick PlainElement -- AddElement EditElement ViewElement ListElement
    A: ***CHOICE***
    Q: Where?
    A: ***POSITION***

PLACEMENTS:

* Page elements:
  * PageStackElement (NS) can only go into another PageStackElement or /src/pages (main page)
  * PageStackSingleLoading can only go into a PageStackListLoading
  * PageStackListLoading can only go into a PageStackSingleLoading or /src/pages (main page)

  * PagePlainElement(NS)  can go in any *StackElement (./my-parent-stack-element/) or /src/pages (main page)
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



*/
  let typeChoices = [
    {
      title: 'Root page element (for main entry points)',
      value: 'stack-page'
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
        title: 'View page (to view a record)',
        value: 'view'
      },
      {
        title: 'Edit page (to edit a record)',
        value: 'edit'
      },
      {
        title: 'Add page(to add a record)',
        value: 'add'
      },
      {
        title: 'List page (to list several records)',
        value: 'list'
      }
    ]
  }


/*
YOU ARE HERE 
ROOT PAGE: If stores are not available, simply force isList = 0. No loading will ever happen

SUB PAGE: IF stores are not available, 

*/


  answers.type = await utils.prompt({
    type: 'select',
    message: 'Which type of element?',
    choices: typeChoices
  })

  answers.elementName = await utils.prompt({
    type: 'text',
    message: `${toHumanName(answers.type)} element name`,
    initial: '',
    validate: (value) => {
      return utils.elementNameValidator(config, value)
    }
  })

  if (!elementIsPage(answers.type)) {
    //
    answers.scope = await utils.prompt({
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

    answers.insertElement = await utils.prompt({
      type: 'confirm',
      name: 'insertElement',
      message: 'Would you like to place the element in another element?',
      initial: true
    })

    if (answers.insertElement) {
      answers.destination = await utils.prompt({
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

  if (answers.type === 'root-page') {
    //
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

    if (config.userInput['client-app-frame'].dynamicLoading) {
      answers.uncommentedStaticImport = await utils.prompt({
        type: 'toggle',
        name: 'value',
        message: 'Force static load with static import, even though app supports dynamic imports',
        initial: false
      })
    } else {
      answers.uncommentedStaticImport = true
    }
  }

  if (answers.type === 'page') {
    //
    answers.destination = await utils.prompt({
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

    answers.subPath = await utils.prompt({
      type: 'text',
      name: 'subPath',
      message: `Nested URL, coming from ${answers.destination.pagePath}`,
      validate: (value) => {
        return utils.pagePathValidator(config, value, answers.destination.pagePath)
      }
    })
  }

  // Store questions (for non-plain elements)
  answers.store = null
  if (['view', 'edit', 'list'].includes(answers.type)) {
    answers.store = await utils.askStoreQuestions(config)
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

  /* COMMON PROPS */
  const type = answers.type
  const scope = answers.scope
  const store = answers.store
  const elementName = utils.elementNameFromInput(answers.elementName, answers.type)
  const baseClass = elementBaseClass(type)
  const fieldElements = utils.fieldElements(type, config, answers, store)
  const name = `${config.vars.elPrefix}-${elementName}`
  const nameNoPrefix = elementName

  /* EXTRA PROPS */
  const insertElement = answers.insertElement && answers.destination

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
