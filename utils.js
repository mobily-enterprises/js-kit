const regexpEscape = require('escape-string-regexp')

exports.addMixinToElement = async function (contents, m, config) {
  return contents.replace(/([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.addMixinToMixin = async function (contents, m, config) {
  return contents.replace(/([ \t]*return[ \t]+class[ \t]+Base[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.findAnchorPoints = (config, anchorPoints) => {

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

    return res
  }

  return config.utils.findAnchorPoints(config, anchorPoints, getFileInfo)
}


exports.humanizeAnchorPoint  = (anchorPoint) => {
  switch (anchorPoint) {
    case '<!-- Element insertion point -->': return 'in element'
    case '<!-- Element tab insertion point -->': return 'in tab'
    case '<!-- Page tab insertion point -->': return 'in page tab'
    default: return anchorPoint
  }
}
