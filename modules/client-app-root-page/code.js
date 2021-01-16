const utils = require('../../utils.js')
const path = require('path')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'select',
      name: 'type',
      message: 'Which type of page?',
      choices: [
        {
          title: 'Plain page',
          value: 'plain'
        },
        {
          title: 'List page',
          value: 'list'
        },
        {
          title: 'View page',
          value: 'view'
        },
        {
          title: 'Edit page',
          value: 'edit'
        },
      ]
    },
    {
      type: 'text',
      name: 'elementName',
      message: 'Page element name',
      initial: '',
      validate: utils.elementNameValidator(config)
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

exports.postPrompts = (config) => {
  const userInput = config.userInput['client-app-root-page']
  userInput.elementName = userInput.type === 'plain' ? userInput.elementName : `${userInput.type}-${userInput.elementName}`

  const newElementInfo = config.vars.newElementInfo = {
    baseClass: 'PageElement',
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
    notInDrawer: userInput.notInDrawer
  }
}

exports.boot = (config) => { }

exports.postAdd = (config) => { }

exports.fileRenamer = (config, file) => {
  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.newElementInfo.type) return

  switch (file) {
    case 'plain-PREFIX-ELEMENTNAME.js':
    case 'list-PREFIX-ELEMENTNAME.js':
    case 'view-PREFIX-ELEMENTNAME.js':
    case 'edit-PREFIX-ELEMENTNAME.js':
      return `src/pages/${config.vars.newElementInfo.name}.js`
    default:
      return file
  }
}
