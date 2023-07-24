const installModule = require('../../node_modules/scaffoldizer/commands/add.js').installModule
const executeManipulations = require('../../node_modules/scaffoldizer/lib/utils.js').executeManipulations
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => {
  return "Pick the previx of your app's elements. If you pick 'my', elements will be 'my-something', 'my-something-else' and so on"
}

exports.prePrompts = (config) => { }

exports.getPrompts = async (config) => {
  const answers = {}

  answers.appName = await utils.prompt({
    type: 'text',
    message: 'App name',
    initial: ''
  })
  answers.elPrefix = await utils.prompt({
    type: 'text',
    message: 'Elements\' name prefix',
    initial: 'my'
  })
  answers.dynamicLoading = await utils.prompt({
    type: 'toggle',
    message: 'Enable dynamic loading of pages',
    initial: false
  })

  return answers
}

exports.boot = (config) => {
  config.vars.elPrefix = config.userInput['client-app-frame'].elPrefix
}

exports.preAdd = async (config) => { }

exports.postAdd = async (config) => {
  //
  await installModule('client-app-element', config, {
    elementClass: 'PagePlainElement',
    pagePath: '',
    title: 'Home',
    menuTitle: 'Home',
    inDrawer: true,
    uncommentedStaticImport: true,
    elementName: 'home'
  })

  await installModule('client-app-element', config, {
    elementClass: 'PagePlainElement',
    pagePath: '/**',
    title: 'Not found',
    menuTitle: 'Home',

    inDrawer: false,
    uncommentedStaticImport: true,
    elementName: 'not-found',
    tailEnd: true
  })

  await installModule('client-app-element', config, {
    elementClass: 'PagePlainElement',
    pagePath: 'load-error',
    title: 'Load Error',
    inDrawer: false,
    uncommentedStaticImport: true,
    elementName: 'load-error'
  })

  /*
  // Take the return off once installModule() can be used to add a plain element
  await installModule('client-app-element', config, {
    type: 'root-page',
    elementName: 'landing',
    elementTitle: 'Landing Page',
    elementMenuTitle: 'Landing',
    uncommentedStaticImport: true,
    ownPath: true,
    pagePath: ''
  })

  await installModule('client-app-element', config, {
    type: 'root-page',
    elementName: 'not-found',
    elementTitle: 'Not found',
    elementMenuTitle: 'Not Found',
    uncommentedStaticImport: true,
    notInDrawer: true,
    tailEnd: true,
    ownPath: true,
    pagePath: '/**'

  })

  executeManipulations(config, {
    text: {
      'src/pages/<%=vars.elPrefix%>-page-not-found.js': [
        {
          op: 'resolve-ejs'
        },
        {
          op: 'insert',
          position: 'before',
          newlineAfter: false,
          anchorPoint: '<!-- Element insertion point -->',
          valueFromFile: 'notFound.html'
        },
        {
          op: 'insert',
          position: 'before',
          newlineAfter: false,
          anchorPoint: '/* Loaded modules -- end ',
          value: "import { warning } from '../styles/icons.js'\nimport { shadow2 } from '../styles/shared-styles.js'"
        },
        {
          op: 'insert',
          position: 'before',
          newlineAfter: false,
          anchorPoint: '/* Element styles -- end ',
          valueFromFile: 'warning-css.css'
        }
      ]
    }
  })

  await installModule('client-app-element', config, {
    type: 'root-page',
    elementName: 'load-error',
    elementTitle: 'Load error',
    elementMenuTitle: 'Load error',
    uncommentedStaticImport: true,
    notInDrawer: true
  })

  executeManipulations(config, {
    text: {
      'src/pages/<%=vars.elPrefix%>-page-load-error.js': [
        {
          op: 'resolve-ejs'
        },
        {
          op: 'insert',
          position: 'before',
          newlineAfter: false,
          anchorPoint: '<!-- Element insertion point -->',
          valueFromFile: 'loadError.html'
        },
        {
          op: 'insert',
          position: 'before',
          newlineAfter: false,
          anchorPoint: '/* Loaded modules -- end/',
          value: "import { warning } from '../styles/icons.js'\nimport { shadow2 } from '../styles/shared-styles.js'"
        },
        {
          op: 'insert',
          position: 'before',
          newlineAfter: false,
          anchorPoint: '/* Element styles -- end/',
          valueFromFile: 'warning-css.css'
        }
      ]
    }
  })
  */
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/lib/base/elements/PREFIX-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-header.js`
    case 'src/lib/base/elements/PREFIX-page-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-page-header.js`
    case 'src/lib/base/elements/PREFIX-toggle-button.js': return `src/lib/base/elements/${config.vars.elPrefix}-toggle-button.js`
    default: return file
  }
}
