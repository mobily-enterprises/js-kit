exports.getPromptsHeading = (config) => {
  return "Pick the previx of your app's elements. If you pick 'my', elements will be 'my-something', 'my-something-else' and so on"
}

exports.getPrompts = (config) => {
  return [
    {
      type: 'text',
      name: 'elPrefix',
      message: 'Element name prefix',
      initial: 'my'
    }
  ]
}

exports.prePrompts = (config) => {
}

exports.preAdd = (config) => {
  config.vars.elPrefix =  config.userInput['client-app-frame'].elPrefix
}

exports.postAdd = (config) => {
}
