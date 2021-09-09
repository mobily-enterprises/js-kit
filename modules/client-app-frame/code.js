const installModule = require('../../node_modules/scaffoldizer/commands/add.js').installModule
const executeManipulations = require('../../node_modules/scaffoldizer/lib/utils.js').executeManipulations

exports.getPromptsHeading = (config) => {
  return "Pick the previx of your app's elements. If you pick 'my', elements will be 'my-something', 'my-something-else' and so on"
}

exports.prePrompts = (config) => { }

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

exports.boot = (config) => {
  config.vars.elPrefix =  config.userInput['client-app-frame'].elPrefix
}

exports.preAdd = async (config) => { }

exports.postAdd = async (config) => {
  await installModule('client-app-root-page', config, {
    type: 'plain',
    elementName: 'landing',
    elementTitle: 'Landing Page',
    elementMenuTitle: 'Landing',
    uncommentedStaticImport: true,
    ownPath: true,
    pagePath: '',
  })

  await installModule('client-app-root-page', config, {
    type: 'plain',
    elementName: 'not-found',
    elementTitle: 'Not found',
    elementMenuTitle: 'Not Found',
    uncommentedStaticImport: true,
    notInDrawer: true,
    ownPath: true,
    pagePath: '/**'

  })

  executeManipulations(config, {
    text: {
      "src/pages/<%=vars.elPrefix%>-not-found.js":[
        {
          "op":"resolve-ejs"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"<!-- Element insertion point -->",
          "valueFromFile":"notFound.html"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"/* Loaded modules -- end */",
          "value":"import { warning } from '../styles/icons.js'\nimport { shadow2 } from '../styles/shared-styles.js'"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"/* Element styles -- end */",
          "valueFromFile":"warning-css.css"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"/* Host styles -- end */",
          "value":"animation: fadeIn 0.3s ease-in;\ntext-align: center;"
        }
      ]
    }
  })


  await installModule('client-app-root-page', config, {
    type: 'plain',
    elementName: 'load-error',
    elementTitle: 'Load error',
    elementMenuTitle: 'Load error',
    uncommentedStaticImport: true,
    notInDrawer: true
  })

  executeManipulations(config, {
    text: {
      "src/pages/<%=vars.elPrefix%>-load-error.js":[
        {
          "op":"resolve-ejs"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"<!-- Element insertion point -->",
          "valueFromFile":"loadError.html"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"/* Loaded modules -- end */",
          "value":"import { warning } from '../styles/icons.js'\nimport { shadow2 } from '../styles/shared-styles.js'"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"/* Element styles -- end */",
          "valueFromFile":"warning-css.css"
        },
        {
          "op":"insert",
          "position":"before",
          "newlineAfter":false,
          "anchorPoint":"/* Host styles -- end */",
          "value":"animation: fadeIn 0.3s ease-in;\ntext-align: center;"
        }
      ],
    }
  })
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/lib/base/elements/PREFIX-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-header.js`
    case 'src/lib/base/elements/PREFIX-page-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-page-header.js`
    case 'src/lib/base/elements/PREFIX-toggle-button.js': return `src/lib/base/elements/${config.vars.elPrefix}-toggle-button.js`
    default: return file
  }
}
