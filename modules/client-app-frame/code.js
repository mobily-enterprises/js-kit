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
    typeOfElement: 'page',
    elementClass: 'PagePlainElement',
    pagePath: '',
    title: 'Home',
    menuTitle: 'Home',
    inDrawer: true,
    uncommentedStaticImport: true,
  })

  await installModule('client-app-element', config, {
    typeOfElement: 'page',
    elementClass: 'PagePlainElement',
    pagePath: '/_load-error',
    title: 'Load Error',
    inDrawer: false,
    uncommentedStaticImport: true,
    tailEnd: true
  })

  await installModule('client-app-element', config, {
    typeOfElement: 'page',
    elementClass: 'PagePlainElement',
    pagePath: '/_loading',
    title: 'Loading',
    inDrawer: false,
    uncommentedStaticImport: true,
    tailEnd: true
  })

  await installModule('client-app-element', config, {
    typeOfElement: 'page',
    elementClass: 'PagePlainElement',
    pagePath: '/**',
    title: 'Not found',
    menuTitle: 'Home',
    inDrawer: false,
    uncommentedStaticImport: true,
    tailEnd: true
  })

  const changes = [
    {
      srcFile: 'src/pages/<%=vars.elPrefix%>-_not-found.js',
      contentsFile: 'notFound.html'
    },
    {
      srcFile: 'src/pages/<%=vars.elPrefix%>-_load-error.js',
      contentsFile: 'loadError.html'
    },
    {
      srcFile: 'src/pages/<%=vars.elPrefix%>-_loading.js',
      contentsFile: 'loading.html'
    }

  ]
  for (const data of changes) {
    // Manipulation of the two "error" files
    executeManipulations(config, {
      text: {
        [data.srcFile]: [
          {
            op: 'insert',
            insertBelow: true,
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
            anchorPoint: '.....<contents>...***</contents>.....',
            valueFromFile: data.contentsFile
          },
          {
            op: 'insert',
            anchorPoint: '.....***class Element.....',
            value: "import { warning } from '../styles/icons.js'\nimport { shadow2 } from '../styles/shared-styles.js'"
          },
          {
            op: 'insert',
            anchorPoint: '.....static get styles () {...return [...css`***.....',
            valueFromFile: 'warning-css.css',
            insertBelow: true
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
