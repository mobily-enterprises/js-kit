
exports.getPromptsHeading = (config) => {
}

exports.getPrompts = (config) => {
}

exports.prePrompts = (config) => {
}

exports.preAdd = (config) => {
  config.vars.appFile =  config.utils.toCamelCase(config.dstPackageJsonValues.name)
}

exports.postAdd = (config) => {
}

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/__APP_CODE__.js': return `src/${config.vars.appFile}.js`
    case 'src/__APP_ELEMENT__.js': return `src/${config.dstPackageJsonValues.name}.js`
    default: return file
  }
}
