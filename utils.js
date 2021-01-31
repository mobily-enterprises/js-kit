const regexpEscape = require('escape-string-regexp')
const prompts = require('prompts')
const fs = require('fs')
const path = require('path')

exports.addMixinToElement = async function (contents, m, config) {
  return contents.replace(/([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.addMixinToMixin = async function (contents, m, config) {
  return contents.replace(/([ \t]*return[ \t]+class[ \t]+Base[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.replaceBaseClass = async function (contents, m, config) {
  const originalBaseClassRegExp = /([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)[ \t]*\{/
  const match = contents.match(originalBaseClassRegExp)
  if (match) originalBaseClass = match[2]
  return contents
    // Take out the bast class from the class declaration
    .replace(originalBaseClassRegExp ,`$1${regexpEscape(m.baseClass)} \{`)
    // Take out the import for the base class, which is no longer used
    .replace(new RegExp(`^([ \t]*import.*)${regexpEscape(originalBaseClass)}([ \t]*,?[ \t]*)(.*)$`, 'm'), '$1$3' )}

exports.maybeAddStarToPath = async function (contents, m, config) {
  if (contents.match(/[ \t]*static[ \t]+get[ \t]+pagePath.*?\*\*\'/)) return contents
  return contents.replace(/([ \t]*static[ \t]+get[ \t]+pagePath[ \t]*\([ \t]*\)[ \t]*{[ \t]*return[ \t]*\[[ \t]*\')(.*?)(\'.*?)/,`$1$2', '$2/\*\*$3`)
}

exports.findAnchorPoints = (config, anchorPoints, keepContents = false) => {

  const getFileInfo = function (contents) {
    let m
    let res = {}
    // Look for mixed in classes
    m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)\(([\w]+)[\)]+.*$/m)
    if (m) {
      res = {
        ...res,
        mixins: m[1].split('(').join(','),
        baseClass: m[2],
        description: `${m[2]}, mixed with ${m[1]}`
      }
    } else {
      // Look for mixed in classes
      m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)[ \t]+\{$/m)
      if (m) {
        res = {
          ...res,
          baseClass: m[1],
          description: `${m[1]}`
        }
      }
    }

    // Find the page's path
    m = contents.match(/^[ \t]*static[ \t]+get[ \t]+pagePath[ \t]+.*?\'(.*?)\'.*?$/m)
    if (m) res.pagePath = m[1]

    m = contents.match(/^[ \t]*window[ \t]*\.[ \t]*customElements[ \t]*\.[ \t]*define[ \t]*\(\'(.*?)\'.*$/m)
    if (m) res.definedElement = m[1]

    m = contents.match(/^[ \t]*static[ \t]+get[ \t]+storeName[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
    if (m) res.storeName = m[1]

    m = contents.match(/^[ \t]*static[ \t]+get[ \t]+table[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
    if (m) res.storeTable = m[1]

    m = contents.match(/^[ \t]*static[ \t]+get[ \t]+publicURL[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
    if (m) res.storePublicURL = m[1]

    m = contents.match(/^[ \t]*static[ \t]+get[ \t]+version[ \t]*\([ \t]*\)[ \t]*\{.*?'(.*?)'.*$/m)
    if (m) res.storeVersion = m[1]

    return res
  }

  return config.utils.findAnchorPoints(config, anchorPoints, getFileInfo, keepContents)
}


exports.humanizeAnchorPoint  = (anchorPoint) => {
  switch (anchorPoint) {
    case '<!-- Element insertion point -->': return ''
    case '<!-- Element tab insertion point -->': return '(in tab)'
    case '<!-- Routed element tab insertion point -->': return '(in routed tab)'
    default: return anchorPoint
  }
}

exports.allFiles  = (config) => {
  // Get all the files, memoizing it
  exports.allFiles.list = exports.allFiles.list || exports.findAnchorPoints(config, '')
  return exports.allFiles.list
}
exports.allFiles.list = null

exports.allStores = (config) => {
  let foundStores = exports
    .allFiles(config)
    .filter(f => f.info.storeName && f.info.storeTable)

  return foundStores.map(e => { return { title: `/${e.info.storeVersion}/${e.info.storeName} -- ${e.info.storePublicURL}`, value: { file: e.file, version: e.info.storeVersion, name: e.info.storeName } } } )
}

exports.findAttributeInAllFiles = (config, name, value) => {
  return exports.allFiles(config).find(o => o.info[name] === value)
}

exports.findMatchingStoreNameAndVersions = (config, version, storeName) => {
  const list = exports.allFiles(config).filter(o => o.info.storeName === storeName)
  if (!list.find(o => o.info.storeVersion === version)) return ''
  return `Store already exists in this version - ${list.map(e => `${e.info.storeVersion}/${e.info.storeName}`).join(', ')}`
}

exports.elementNameValidator = (config, value, prev) => {
  return !value.match(/^[a-z]+[a-z0-9\-]*$/)
    ? 'Only lower case characters, numbers and dashes allowed'
    : (
      exports.findAttributeInAllFiles(config, 'definedElement', `${config.vars.elPrefix}-${exports.elementNameFromInput(config, value, prev)}`)
        ? 'Element already defined'
        : true
    )
}


exports.pagePathValidator = (config, value, prev) => {
  return !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/)
  ? 'Valid URLs, starting with "/" or "#"'
  : (
    exports.findAttributeInAllFiles(config, 'pagePath', `${prev.pagePath }${value}`)
      ? 'Element already defined'
      : true
  )
}
exports.pageTypeQuestion = (config) => {
  let choices
  if (fs.existsSync(path.join(config.dstScaffoldizerInstalledDir, 'client-app-stores'))) {
    return {
      type: 'select',
      name: 'type',
      message: 'Which type of page?',
      choices : [
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
          title: 'Add/edit page',
          value: 'add-edit'
        },
      ]
    }
  } else {

    // No input done. Just set the user input
    return {
      type: null,
    }
  }
}

exports.elementNameFromInput = (config, enteredName, type = 'plain')  => {
  return `${type === 'plain' ? '' : `${type}-`}${enteredName}`
}

exports.storeVersionValidator = (config, value, storeName) => {
  let res
  return !value.match(/^[0-9]+\.[0-9]\.[0-9]$/)
    ? 'Must be in format n.n.n E.g. 2.0.0'
    : (
      (res = exports.findMatchingStoreNameAndVersions(config, value, storeName))
        ? res
        : true
    )
}

exports.pageBaseClass = (type) => {
  const lookup = {
    'plain': '',
    'add-edit': 'AddEdit',
    'list': 'List',
    'view': 'View'
  }

  return `${lookup[type]}PageElement`
}


exports.storeNameValidator = (config) => {
  return function (value) {
    return !value.match(/^[a-z]+[A-Za-z0-9\-]*$/)
    ? 'Must be camelCase, with letters and numbers, and start with lower case'
    : true
  }
}

exports.storePublicURLValidator = (config) => {
  return function (value) {
    return !value.match(/^\/[a-z0-9A-Z\-\/_]*$/)
      ? 'Valid URLs, starting with "/", and without trailing "/"'
      : (
        exports.findAttributeInAllFiles(config, 'storePublicURL', value)
          ? 'Store URL already defined by another store'
          : true
      )
  }
}

exports.publicURLprefixValidator = (config) => {
  return function (value) {
    return !value.match(/^[A-Za-z0-9\-_]*$/)
    ? 'Must be letters and numbers (underscore and dash allowed)'
    : true
  }
}

exports.storeChoices = [
  {
    title: 'GET -- one element (e.g. GET /store/1)',
    value: 'get',
    selected: true
  },
  {
    title: 'GET -- several elements (e.g. GET /store)',
    value: 'getQuery',
    selected: true

  },
  {
    title: 'PUT (e.g. PUT /store/1)',
    value: 'put',
    selected: true

  },
  {
    title: 'POST (e.g. POST /store)',
    value: 'post',
    selected: true

  },
  {
    title: 'DELETE (e.g. DELETE /store/1)',
    value: 'delete',
    selected: false
  },
]


exports.askStoreQuestions = async (config) => {

  store =  await prompts([
    {
      type: 'select',
      message: 'Store to query',
      name: 'store',
      choices: exports.allStores(config)
    }
  ])

  debugger
  const storeObject = require(path.join(config.dstDir, store.store.file) )

  // storeObject.schema.structure -- get list, filtering out ID and position field
  // Let user select which ones
  // Return list of fields, with info attached, in userInput


}
