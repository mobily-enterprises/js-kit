const path = require('path')
const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {

  function anchorPoints () {
    let foundAnchorPoints = config.utils
      .findAnchorPoints('<!-- Page tab insertion point -->', config.dstDir, utils.getFileInfo)
      .filter(e => e.info.pagePath)

    if (!foundAnchorPoints.length) {
      console.log('There are no insertion points available for this element. Please add a page first.')
      process.exit(1)
    }

    return foundAnchorPoints.map(e => { return {
      title: `${e.file} -- ${e.info.description} (${utils.humanizeAnchorPoint(e.anchorPoint)})`,
      value: {
        file: e.file,
        anchorPoint: e.anchorPoint,
        pagePath: e.info.pagePath,
      }
    }})
  }

  const questions = [
    {
      type: 'select',
      name: 'type',
      message: 'Which type of element?',
      choices: [
        {
          title: 'Standard element',
          value: 'standard'
        },
        {
          title: 'List element',
          value: 'list'
        },
        {
          title: 'View element',
          value: 'view'
        },
        {
          title: 'Edit element',
          value: 'edit'
        },
      ]
    },
    {
      type: 'text',
      name: 'elementName',
      message: 'Element name',
      initial: '',
      validate: value => !value.match(/^[a-z]+[a-z0-9\-]*$/) ? 'Only lower case characters, numbers and dashes allowed' : true
    },

    {
      type: 'text',
      name: 'elementTitle',
      message: 'Element title',
      initial: '',
      validate: value => !value.match(/^[a-zA-Z0-9 ]+$/) ? 'Only characters, numbers and spaces allowed' : true
    },

    {
      type: 'select',
      name: 'destination',
      message: 'Destination element',
      choices: anchorPoints()
    },
    {
      type: 'text',
      name: 'subUrl',
      message: prev => `Nested URL, coming from ${prev.pagePath}`,
      choices: anchorPoints(),
      validate: value => !value.match(/^[\/\#]+[a-z0-9\-\/_]*$/) ? 'Valid URLs, starting with "/" or "#"' : true
    },
  ]
  return questions
}

exports.postPrompts = async (config) => {
  const userInput = config.userInput['client-app-inner-page']

  // New page's info
  // No placement by default
  const newElementInfo = config.vars.newElementInfo = {
    baseClass: 'AppElement',
    type: userInput.type,
    name: `${config.vars.elPrefix}-${userInput.elementName}`,
    nameNoPrefix: userInput.elementName,
    title: userInput.elementTitle,
    menuTitle: userInput.elementMenuTitle,
    placeElement: false
  }

  /*
   [ ] Work out the path of the file (the chosen file, munus the 'js' at the end)
   [ ] Work out relative link from container to element
   [ ] Work out pagePath

   [ ] Make sure fileRanamer copies the file to the right spot
   [ ] Add module.json writing to add import to parent file (same as appElement)
   [ ] Add module.json writing to add entry in tab to parent file (same as AppElement)
   [ ]
  */

  // Work out the relative path from the two path's location. Note: if the files are in the same
  // spot, it will need to be assigned at least a "."
  // When joining them together, `path.sep` is used since path.join will normalise things, and
  // eat away that './' (if present)
  const fileToImport = `src/elements/${newElementInfo.name}.js`
  let relativePath = path.relative(path.dirname(userInput.destination.file), path.dirname(fileToImport)) || '.'
  const importPath = `${relativePath}${path.sep}${path.basename(fileToImport)}`

  // New page's info
  if (userInput.placeElement && userInput.destination) {
    config.vars.newElementInfo.placeElement = true
    config.vars.newElementInfo.importPath = importPath
    config.vars.newElementInfo.destination =  userInput.destination
  }
  */
}

exports.boot = (config) => { }

exports.fileRenamer = (config, file) => {
  // Skip copying of the wrong type of pages
  if (file.split('-')[0] !== config.vars.newElementInfo.type) return

  switch (file) {
    case 'standard-PREFIX-ELEMENTNAME.js': return `src/elements/${config.vars.newElementInfo.name}.js`
    case 'list-PREFIX-ELEMENTNAME.js': return `src/elements/list-${config.vars.newElementInfo.name}.js`
    case 'view-PREFIX-ELEMENTNAME.js': return `src/elements/view-${config.vars.newElementInfo.name}.js`
    case 'edit-PREFIX-ELEMENTNAME.js': return `src/elements/edit-${config.vars.newElementInfo.name}.js`
    default: return file
  }
}
