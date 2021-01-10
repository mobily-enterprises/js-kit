
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
      message: 'Element name',
      initial: '',
      validate: value => !value.match(/^[a-z]+[a-z0-9\-]*$/) ? 'Only lower case characters, numbers and dashes allowed' : true
    },
    {
      type: 'text',
      name: 'elementTitle',
      message: 'Element title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    },
    {
      type: 'text',
      name: 'elementMenuTitle',
      message: 'Element menu title',
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

  return questions
}

exports.postPrompts = (config) => {
  const userInput = config.userInput['client-app-root-page']

  config.vars.newElementInfo = {
    baseClass: 'PageElement',
    pagePath: `/${userInput.elementName}`,
    type: userInput.type,
    name: `${config.vars.elPrefix}-${userInput.elementName}`,
    nameNoPrefix: userInput.elementName,
    title: userInput.elementTitle,
    menuTitle: userInput.elementMenuTitle,
    uncommentedStaticImport: userInput.uncommentedStaticImport
  }
}

exports.boot = (config) => { }

exports.postAdd = (config) => { }

exports.fileRenamer = (config, file) => {
  debugger
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
