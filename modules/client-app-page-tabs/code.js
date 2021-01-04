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
  config.utils.prompts( {
    type: 'text',
    name: 'stocazzo',
    message: 'Tab id',
    initial: '',
    }
  )
  console.log("TEST 1:", config.utils.walk(config.dstDir))
  console.log("TEST 2:", config.utils.findAnchorPoints('<!-- Element insertion point -->', config.dstDir))



  const manipulations = {
    text: {
      "":[
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
  await config.utils.executeManipulations(manipulations, )


}

exports.fileRenamer = (config, file) => {
}
