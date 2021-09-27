const utils = require('../../utils.js')
const path = require('path')
const executeManipulations = require('../../node_modules/scaffoldizer/lib/utils.js').executeManipulations

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {

  let globalPrev

  const questions = [
    utils.elementTypeQuestion(config, 'page'),
    {
      type: 'text',
      name: 'elementName',
      message: (prev) => { globalPrev = prev; return 'Page element name' },
      initial: '',
      validate: (value) => {
        return utils.elementNameValidator(config, value, globalPrev)
      }
    },
    {
      type: 'text',
      name: 'elementTitle',
      message: 'Page title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    },
    {
      type: 'text',
      name: 'elementMenuTitle',
      message: 'Page menu title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    }

  ]

  if (config.userInput['client-app-frame'].dynamicLoading) {
    questions.push(
      {
        type: 'toggle',
        name: 'uncommentedStaticImport',
        message: 'Force static load with static import, even though app supports dynamic imports',
        initial: false
      }
    )
  } else {
    config.userInput['client-app-root-page'].uncommentedStaticImport = true
  }

  // The 'pagePath' and 'notInDrawer' keys are not listed, but are used in postPrompts to set
  // newElementInfo. TODO: consider whether allowing custom paths and chance NOT to add to drawer

  return questions
}

exports.postPrompts = async (config) => {
  let userInput = config.userInput['client-app-root-page']
  let fieldElements = {}

  if (!userInput.type) userInput.type = 'plain'
  userInput.elementName = utils.elementNameFromInput(config, userInput.elementName, userInput.type)
  const baseClass = utils.pageBaseClass(userInput.type)

  if (userInput.type !== 'plain') {
     userInput.store = await utils.askStoreQuestions(config)
  }
  
  if (userInput.type === 'edit') {
    fieldElements = utils.fieldElements(userInput.store)
  }
  
    // For AddEdit, use function to work out form string
    // Run the transformation to add those fields
  

debugger

  const newElementInfo = config.vars.newElementInfo = {
    baseClass,
    ownHeader: true,
    ownPath: true,
    pagePath: typeof userInput.pagePath !== 'undefined' ? userInput.pagePath : `/${userInput.elementName}`,
   
    type: userInput.type,
    name: `${config.vars.elPrefix}-${userInput.elementName}`,
    nameNoPrefix: userInput.elementName,
    title: userInput.elementTitle,
    menuTitle: userInput.elementMenuTitle,
    uncommentedStaticImport: userInput.uncommentedStaticImport,
    libPath: '../lib',
    notInDrawer: userInput.notInDrawer,
    store: userInput.store,
    fieldElements: fieldElements
  }


}

exports.boot = (config) => { }

exports.postAdd = (config) => {
  /*
  let userInput = config.userInput['client-app-root-page']


YOU ARE HERE

  switch (userInput.type) {
    case 'edit':
      
      executeManipulations(config, {
        "text":{
          "src/pages/<%=vars.newElementInfo.name%>.js":[
            {
              "op":"insert",
              "position":"before",
              "newlineAfter":false,
              "anchorPoint":"<!-- Element insertion point -->",
              "valueFromFile":"notFound.html"
            },
          ]
        }
      })

      break

    case 'list':
      break

    case 'view':
      break

  }


*/
 }

exports.fileRenamer = (config, file) => {
  // Skip copying of the wrong type of pages
  if (!file.startsWith(config.vars.newElementInfo.type)) return

  switch (file) {
    case 'plain-PREFIX-ELEMENTNAME.ejs':
    case 'list-PREFIX-ELEMENTNAME.ejs':
    case 'view-PREFIX-ELEMENTNAME.ejs':
    case 'edit-PREFIX-ELEMENTNAME.ejs':
      return `src/pages/${config.vars.newElementInfo.name}.js`
    default:
      return file
  }
}
