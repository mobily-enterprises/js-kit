exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
}

exports.getPrompts = (config) => {
  const questions = [
    {
      type: 'text',
      name: 'id',
      message: 'Tab id',
      initial: '',
      validate: value => !value.match(/^[a-z]+[a-z0-9\-]*$/) ? 'Only lower case characters, numbers and dashes allowed' : true
    }
  ]

  return questions
}
exports.boot = (config) => {
}

exports.preAdd = (config) => {
}

exports.postAdd = async (config) => {
  const anchorPoints = config.utils.findAnchorPoints('<!-- Element insertion point -->', config.dstDir, config.scaffoldUtilsFunctions.getFileInfo)

  if (!anchorPoints.length) {
    console.log('There are no insertion points available in the project')
    return
  }

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
      [destination.destination]:[
        {
           "op":"insert",
           "position":"after",
           "newlineAfter":true,
           "anchorPoint":"<!-- Element insertion point -->",
           "valueFromFile":"element-tabs.js"
        }
      ]
    }
  }
  await config.utils.executeManipulations(manipulations, config)
}

exports.fileRenamer = (config, file) => {
}
