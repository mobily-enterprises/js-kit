
exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
}


exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'text',
      name: 'elementName',
      message: 'Element name',
      initial: '',
      validate: value => !value.match(/[a-zA-Z]+[a-zA-Z0-9\-]*/) ? 'Only characters, numbers and dashes allowed' : true
    },
    {
      type: 'text',
      name: 'elementTitle',
      message: 'Element title',
      initial: '',
      validate: value => !value.match(/[a-zA-Z]+[a-zA-Z0-9\-]*/) ? 'Only characters, numbers and dashes allowed' : true
    },
    {
      type: 'text',
      name: 'elementMenuTitle',
      message: 'Element menu title',
      initial: '',
      validate: value => !value.match(/[a-zA-Z0-9 ]+/) ? 'Only characters, numbers and spaces allowed' : true
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
    config.userInput['client-root-page'].uncommentedStaticImport = true
  }

  return questions
}
exports.boot = (config) => {
}

exports.preAdd = (config) => {
  // const prefix = config.utils.capitalize(config.utils.toCamelCase(config.vars.elPrefix))
  // const name = config.utils.capitalize(config.utils.toCamelCase(config.userInput['client-root-page'].elementName))
  config.vars.newElementFullNameNoPrefix = `page-${config.userInput['client-root-page'].elementName}`
  config.vars.newElementFullName = `${config.vars.elPrefix}-page-${config.userInput['client-root-page'].elementName}`
}

exports.postAdd = (config) => {
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/PREFIX-ELEMENTNAME.js': return `src/${config.vars.newElementFullName}.js`
    default: return file
  }
}
