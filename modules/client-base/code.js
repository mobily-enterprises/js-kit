
exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
}

exports.prePrompts = (config) => {
}

exports.preAdd = (config) => {
  config.vars.client = {
    appFile: config.utils.toCamelCase(config.dstPackageJsonValues.name)
  }
}

exports.postAdd = (config) => {
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/__APP_CODE__.js': return `src/${config.vars.client.appFile}.js`
    case 'src/__APP_ELEMENT__.js': return `src/${config.dstPackageJsonValues.name}.js`
    default: return file
  }
}
