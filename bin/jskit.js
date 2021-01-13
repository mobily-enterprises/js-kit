#!/usr/bin/env node
const scaffoldizer = require('scaffoldizer')

#!/usr/bin/env node
const { program } = require('scaffoldizer/node_modules/commander')
const { add } = require('scaffoldizer/commands/add')

const jskitPackageJson = require('../package.json')
const commands = {
  add: modules => add('..', '.', modules)
  }
}
// const globals = require('./globals')

const increaseVerbosity = (dummyValue, previous) => previous++

main()

async function main () {
  //
  // Set the version depending on package.json
  program.version(jskitPackageJson.version)

  // The main command: add
  program.option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)

  await program.parseAsync(process.argv)

  program.command('add [modules...]')
    .description('Add modules to project in current directory. You can optionally pass a list of modules to install. Otherwise, a UI will be initiated to pick which modules should be installed')
    .action(commands.add)

  await program.parseAsync(process.argv)
}
