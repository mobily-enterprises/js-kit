exports.getPromptsHeading = (config) => {
  return "Pick the previx of your app's elements. If you pick 'my', elements will be 'my-something', 'my-something-else' and so on"
}

exports.getPrompts = (config) => {
  return [
    {
      type: 'text',
      name: 'appName',
      message: 'App name',
      initial: ''
    },
    {
      type: 'text',
      name: 'elPrefix',
      message: 'Elements\' name prefix',
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

exports.boot = (config) => {
  config.vars.elPrefix =  config.userInput['client-app-frame'].elPrefix
}

exports.preAdd = (config) => {
}

exports.postAdd = (config) => {
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/root-pages/PREFIX-load-error.js': return `src/root-pages/${config.vars.elPrefix}-load-error.js`
    case 'src/root-pages/PREFIX-not-found.js': return `src/root-pages/${config.vars.elPrefix}-not-found.js`
    case 'src/root-pages/PREFIX-landing.js': return `src/root-pages/${config.vars.elPrefix}-landing.js`
    case 'src/lib/base/elements/PREFIX-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-header.js`
    case 'src/lib/base/elements/PREFIX-page-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-page-header.js`
    case 'src/lib/base/elements/PREFIX-toggle-button.js': return `src/lib/base/elements/${config.vars.elPrefix}-toggle-button.js`
    default: return file
  }
}
