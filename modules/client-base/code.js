
exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => { }

exports.boot = (config) => {
  config.vars.appElementName = config.dstPackageJsonValues.name
  if (config.vars.appElementName.indexOf('-') === -1) {
    config.vars.appElementName = `${config.vars.appElementName}-app`
  }

  config.vars.appFile = config.scaffoldizerUtils.toCamelCase(config.vars.appElementName)
}

exports.preAdd = (config) => {

}

exports.postAdd = (config) => { }

exports.fileRenamer = (config, file) => {
  switch (file) {
    case 'src/__APP_CODE__.js': return `src/${config.vars.appFile}.js`
    case 'src/__APP_ELEMENT__.js': return `src/${config.vars.appElementName}.js`
    default: return file
  }
}
