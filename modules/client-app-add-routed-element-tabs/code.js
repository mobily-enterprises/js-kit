const utils = require('../../utils.js')

exports.getPromptsHeading = (config) => { }

exports.prePrompts = (config) => { }

exports.getPrompts = (config) => {

  function anchorPoints () {
    let foundAnchorPoints = utils
      .findAnchorPoints(config, '<!-- Element insertion point -->')
      .filter(e => e.info.baseClass === 'PageElement' || e.info.baseClass === 'RoutedElement')

    if (!foundAnchorPoints.length) {
      console.log('There are no insertion points available for this element. Please add a page first.')
      process.exit(1)
    }

    return foundAnchorPoints.map(e => { return { title: `${e.file} -- ${e.info.description} ${utils.humanizeAnchorPoint(e.anchorPoint)}`, value: { file: e.file, anchorPoint: e.anchorPoint } } } )
  }

  const questions = [
    {
      type: 'text',
      name: 'elementId',
      message: 'Tab id',
      initial: '',
      validate: value => !value.match(/^[a-z]+[a-z0-9\-]*$/) ? 'Only lower case characters, numbers and dashes allowed' : true
    },
    {
      type: 'select',
      name: 'destination',
      message: 'Destination element',
      choices: anchorPoints()
    }
  ]

  return questions
}

exports.boot = (config) => { }

exports.preAdd = (config) => { }

exports.postAdd = async (config) => { }

exports.fileRenamer = (config, file) => { }
