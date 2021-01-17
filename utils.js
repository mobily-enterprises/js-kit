const regexpEscape = require('escape-string-regexp')

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

exports.findAttributeInAllFiles = (config, name, value) => {
  return exports.allFiles(config).find(o => o.info[name] === value)
}

exports.findMatchingStoreNameAndVersions = (config, version, storeName) => {
  return exports.allFiles(config).find(o => o.info.storeName === storeName && o.info.storeVersion === version)
}

exports.elementNameValidator = (config) => {
  return function (value) {
    return !value.match(/^[a-z]+[a-z0-9\-]*$/)
      ? 'Only lower case characters, numbers and dashes allowed'
      : (
        exports.findAttributeInAllFiles(config, 'definedElement', `${config.vars.elPrefix}-${value}`)
          ? 'Element already defined'
          : true
      )
  }
}

exports.storeVersionValidator = (config, value, storeName) => {
  return !value.match(/^[0-9]+\.[0-9]\.[0-9]$/)
    ? 'Must be in format n.n.n E.g. 2.0.0'
    : (
      exports.findMatchingStoreNameAndVersions(config, value, storeName)
        ? 'Storename in same version already defined'
        : true
    )

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

exports.pagePathValidator = (config, value, prev) => {
  return !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/)
  ? 'Valid URLs, starting with "/" or "#"'
  : (
    exports.findAttributeInAllFiles(config, 'pagePath', `${prev.pagePath }${value}`)
      ? 'Element already defined'
      : true
  )
}
