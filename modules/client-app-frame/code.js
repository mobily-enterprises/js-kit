exports.getPromptsHeading = (config) => {
  return "Pick the previx of your app's elements. If you pick 'my', elements will be 'my-something', 'my-something-else' and so on"
}

exports.getPrompts = (config) => {
  return [
    {
      type: 'text',
      name: 'elPrefix',
      message: 'Element name prefix',
      initial: 'my'
    },
    {
      type: 'toggle',
      name: 'dynamicLoading',
      message: 'Enable dynamic loading of pages',
      initial: false
    },
  ]
}

exports.prePrompts = (config) => {
}

exports.preAdd = (config) => {
  config.vars.elPrefix =  config.userInput['client-app-frame'].elPrefix
}

exports.postAdd = (config) => {
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/PREFIX-page-load-error.js': return `src/${config.vars.elPrefix}-page-load-error.js`
    case 'src/PREFIX-page-not-found.js': return `src/${config.vars.elPrefix}-page-not-found.js`
    default: return file
  }
}
