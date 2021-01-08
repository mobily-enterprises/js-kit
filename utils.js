const regexpEscape = require('escape-string-regexp')

exports.addMixinToElement = async function (contents, m, config) {
  return contents.replace(/([ \t]*class[ \t]+\w+[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.addMixinToMixin = async function (contents, m, config) {
  return contents.replace(/([ \t]*return[ \t]+class[ \t]+Base[ \t]+extends[ \t]+)(.*?)([ \t]*)\{/,`$1${regexpEscape(m.mixin)}\($2\)$3\{`)
}

exports.getFileInfo = function (contents) {
  let m
  // Look for mixed in classes
  m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)\(([\w]+)[\)]+.*$/m)
  if (m) return {
    mixins: m[1].split('(').join(','),
    baseClass: m[2],
    description: `${m[2]}, mixed with ${m[1]}`
  }

  // Look for mixed in classes
  m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)[ \t]+\{$/m)
  if (m) return {
    baseClass: m[1],
    description: `${m[1]}`
  }
}

exports.humanizeAnchorPoint  = (anchorPoint) => {
  switch (anchorPoint) {
    case '<!-- Element insertion point -->': return 'in element'
    case '<!-- Element tab insertion point -->': return 'in tab'
    default: return anchorPoint
  }
}


exports.runInsertionManipulations = async function(config, anchorPoints, textManipulations, humanizeAnchorPoint, excludeFile) {
  let foundAnchorPoints = config.utils.findAnchorPoints(anchorPoints, config.dstDir, exports.getFileInfo)

  if (!foundAnchorPoints.length) {
    console.log('There are no insertion points available in the project')
    return
  }

  // Take out the element just added
  foundAnchorPoints = foundAnchorPoints.filter(ap => ap.file !== excludeFile)

  const input = await config.utils.prompts( {
    type: 'select',
    name: 'destination',
    message: 'Destination element',
    choices: foundAnchorPoints.map(e => { return { title: `${e.file} -- ${e.info.description} (${humanizeAnchorPoint(e.anchorPoint)})`, value: { file: e.file, anchorPoint: e.anchorPoint } } } )
    }
  )
  if (!input.destination || !input.destination.file) {
    console.log('No destination file set')
    return

  }

  const file = input.destination.file
  const anchorPoint = input.destination.anchorPoint

  if (typeof textManipulations === 'function') textManipulations = textManipulations(file, anchorPoint)
  const manipulations = {
    text: {
      [file]: textManipulations
    }
  }
  await config.utils.executeManipulations(manipulations, config)
}
