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
    initial: true
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
    pagePath: '/load-error',
    title: 'Load Error',
    inDrawer: false,
    uncommentedStaticImport: true,
    elementName: 'load-error',
    tailEnd: true
  })

  await installModule('client-app-element', config, {
    elementClass: 'PagePlainElement',
    pagePath: '/loading',
    title: 'Loading',
    inDrawer: false,
    uncommentedStaticImport: true,
    elementName: 'loading',
    tailEnd: true
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

  const changes = [
    {
      srcFile: 'src/pages/<%=vars.elPrefix%>-not-found.js',
      contentsfile: 'notFound.html'
    },
    {
      srcFile: 'src/pages/<%=vars.elPrefix%>-load-error.js',
      contentsfile: 'loadError.html'
    },
    {
      srcFile: 'src/pages/<%=vars.elPrefix%>-loading.js',
      contentsfile: 'loading.html'
    }

  ]
  for (const data of changes) {
    // Manipulation of the two "error" files
    executeManipulations(config, {
      text: {
        [data.srcFile]: [
          {
            op: 'insert',
            newlineBefore: true,
            newlineAfter: false,
            anchorPoint: '.....<ee-tabs...</ee-tabs>***.....',
            value: '<contents>\n  <!--Page contents -->\n</contents>'
          },
          {
            op: 'deleteText',
            deleteRegexp: '<ee-tabs[\\s\\S]*</ee-tabs>',
            deleteRegexpOptions: 'm'
          },
          {
            op: 'insert',
            position: 'before',
            newlineBefore: true,
            newlineAfter: false,
            anchorPoint: '.....<contents>...***</contents>.....',
            valueFromFile: data.contentsfile
          },
          {
            op: 'insert',
            position: 'before',
            newlineBefore: false,
            newlineAfter: true,
            anchorPoint: '.....***class Element.....',
            value: "import { warning } from '../styles/icons.js'\nimport { shadow2 } from '../styles/shared-styles.js'"
          },
          {
            op: 'insert',
            position: 'before',
            newlineBefore: true,
            newlineAfter: false,
            anchorPoint: '.....static get styles () {...return [...css`***.....',
            valueFromFile: 'warning-css.css'
          }
        ]
      }
    })
  }
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/lib/base/elements/PREFIX-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-header.js`
    case 'src/lib/base/elements/PREFIX-page-header.js': return `src/lib/base/elements/${config.vars.elPrefix}-page-header.js`
    case 'src/lib/base/elements/PREFIX-toggle-button.js': return `src/lib/base/elements/${config.vars.elPrefix}-toggle-button.js`
    default: return file
  }
}
