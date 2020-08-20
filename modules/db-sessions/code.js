exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
  return [
    {
      type: 'text',
      name: 'secret',
      message: 'Session secret sentence',
      initial: '',
      required: true
    },
    {
      type: 'text',
      name: 'key',
      message: 'Session key (in cookie)',
      initial: config.dstPackageJsonValues.name,
      required: true
    }

  ]
}

exports.prePrompts = (config) => {
}

exports.preAdd = (config) => {
}

exports.postAdd = (config) => {
}
