
exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'select',
      name: 'type',
      message: 'Which type of page?',
      choices: [
        {
          title: 'Standard page',
          value: 'standard'
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
exports.boot = (config) => {
}

exports.preAdd = (config) => {
  // const prefix = config.utils.capitalize(config.utils.toCamelCase(config.vars.elPrefix))
  // const name = config.utils.capitalize(config.utils.toCamelCase(config.userInput['client-app-root-page'].elementName))
  config.vars.newElementFullNameNoPrefix = `${config.userInput['client-app-root-page'].elementName}`
  config.vars.newElementFullName = `${config.vars.elPrefix}-${config.userInput['client-app-root-page'].elementName}`
  config.vars.type = config.userInput['client-app-root-page'].type
  config.vars.elementName = config.userInput['client-app-root-page'].elementName
  config.vars.elementTitle = config.userInput['client-app-root-page'].elementTitle
  config.vars.elementMenuTitle = config.userInput['client-app-root-page'].elementMenuTitle
  config.vars.uncommentedStaticImport = config.userInput['client-app-root-page'].uncommentedStaticImport
  config.vars.baseClass = 'PageElement'
}

exports.postAdd = (config) => { }

exports.fileRenamer = (config, file) => {

  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.type) return

  switch (file) {
    case 'standard-PREFIX-ELEMENTNAME.js': return `src/pages/${config.vars.newElementFullName}.js`
    case 'list-PREFIX-ELEMENTNAME.js': return `src/pages/list-${config.vars.newElementFullName}.js`
    case 'view-PREFIX-ELEMENTNAME.js': return `src/pages/view-${config.vars.newElementFullName}.js`
    case 'edit-PREFIX-ELEMENTNAME.js': return `src/pages/edit-${config.vars.newElementFullName}.js`
    default: return file
  }
}
