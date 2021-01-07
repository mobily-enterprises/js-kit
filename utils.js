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
    description: `Class of type ${m[2]}, mixed with ${m[1]}`
  }

  // Look for mixed in classes
  m = contents.match(/^[ \t]*class[ \t]+\w+[ \t]+extends[ \t]+(.*)[ \t]+\{$/m)
  if (m) return {
    baseClass: m[1],
    description: `Class of type ${m[1]}`
  }
}

exports.runInsertionManipulations = async function(config, anchorPoint, textManipulations, excludeFile) {
  let anchorPoints = config.utils.findAnchorPoints('<!-- Element insertion point -->', config.dstDir, exports.getFileInfo)

  if (!anchorPoints.length) {
    console.log('There are no insertion points available in the project')
    return
  }

  // Take out the element just added
  anchorPoints = anchorPoints.filter(ap => ap.file !== excludeFile)

  const destination = await config.utils.prompts( {
    type: 'select',
    name: 'destination',
    message: 'Destination element',
    choices: anchorPoints.map(e => { return { title: `${e.file} -- ${e.info.description}`, value: e.file } } )
    }
  )

  if (!destination.destination) {
    console.log('No destination set')
    return
  }

  const manipulations = {
    text: {
      [destination.destination]: textManipulations
    }
  }
  await config.utils.executeManipulations(manipulations, config)
}
