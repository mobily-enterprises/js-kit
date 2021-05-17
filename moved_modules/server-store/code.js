const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {
  let storeName
  let version

  const questions = [
    {
      type: 'text',
      name: 'name',
      message: 'Store name (camel case, starting with lower case)',
      initial: '',
      validate: utils.storeNameValidator(config)
    },
    {
      type: 'text',
      name: 'version',
      message: (prev, values) => { storeName = values.name; return 'Store version' },
      initial: config.vars.defaultStoreVersion,
      validate: (value) => {
        return utils.storeVersionValidator(config, value, storeName)
      }
    },
    {
      type: 'text',
      name: 'publicURL',
      message:  (prev, values) => { version = values.version; return `Store URL. /${version}` },
      initial: (prev) => `/${storeName}`,
      validate: utils.storePublicURLValidator(config)
    },
    {
      type: 'multiselect',
      name: 'methods',
      message: 'Which HTTP methods?',
      choices: utils.storeMethodChoices,
    },
    {
      type: 'select',
      name: 'implementation',
      message: 'Store\'s initial implementation',
      choices: [
        {
          title: 'All methods return dummy values to start with',
          value: 'dummy',
          selected: true

        },
        {
          title: 'All methods will throw an error, must be implemented',
          value: 'errors',
          selected: false
        }
      ]
    },

  ]

  return questions
}

exports.postPrompts = async (config) => {
  const userInput = config.userInput['server-store']

  // New page's info
  // No placement by default
  const newStoreInfo = config.vars.newStoreInfo = {
    name: userInput.name,
    version: userInput.version,
    className: config.utils.capitalize(userInput.name),
    methods: userInput.methods,
    version: userInput.version,
    publicURL: userInput.publicURL,
    implementation: userInput.implementation,
    db: false
  }
}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'NON-DB-STORE.js':
      return `server/stores/${config.vars.newStoreInfo.version}/${config.vars.newStoreInfo.name}.js`
    default:
      return file
  }
}
