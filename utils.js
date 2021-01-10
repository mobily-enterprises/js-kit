const regexpEscape = require('escape-string-regexp')

exports.addMixinToElement = async function (contents, m, config) {
  return contents.replace(/([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.addMixinToMixin = async function (contents, m, config) {
  return contents.replace(/([ \t]*return[ \t]+class[ \t]+Base[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
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

    return res
  }

  return config.utils.findAnchorPoints(anchorPoints, config.dstDir, getFileInfo, keepContents)
}


exports.humanizeAnchorPoint  = (anchorPoint) => {
  switch (anchorPoint) {
    case '<!-- Element insertion point -->': return 'in element'
    case '<!-- Element tab insertion point -->': return 'in tab'
    case '<!-- Page tab insertion point -->': return 'in page tab'
    default: return anchorPoint
  }
}

exports.allFiles  = (config) => {
  // Get all the files, memoizing it
  exports.allFiles.list = exports.allFiles.list || exports.findAnchorPoints(config, "<!-- Element insertion point -->")
  return exports.allFiles.list
}
exports.allFiles.list = null

exports.elementAlreadyDefined = (config, el) => {
  return exports.allFiles(config).find(o => o.info.definedElement === el)
}


exports.pagePathAlreadyDefined = (config, pagePath) => {
  return exports.allFiles(config).find(o => o.info.pagePath === pagePath)
}

exports.elementNameValidator = (config) => {
  return function (value) {
    return !value.match(/^[a-z]+[a-z0-9\-]*$/)
    ? 'Only lower case characters, numbers and dashes allowed'
    : (
      exports.elementAlreadyDefined(config, `${config.vars.elPrefix}-${value}`)
        ? 'Element already defined'
        : true
    )
  }
}

exports.pagePathValidator = (config, value, prev) => {
  debugger
  return !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/)
  ? 'Valid URLs, starting with "/" or "#"'
  : (
    exports.pagePathAlreadyDefined(config, `${prev.pagePath }${value}`)
      ? 'Element already defined'
      : true
  )
}
