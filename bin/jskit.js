#!/usr/bin/env node
const { program } = require('../node_modules/commander')
const jskitPackageJson = require('../package.json')
const add = require('../node_modules/scaffoldizer/commands/add.js').add
const run = require('../node_modules/scaffoldizer/commands/run.js').run

const increaseVerbosity = (dummyValue, previous) => previous++

main()

async function main () {
  //
  // Set the version depending on package.json
  program.version(jskitPackageJson.version)

  // The main command: add
  program.option('-v, --verbose', 'verbosity that can be increased', increaseVerbosity, 0)
  //
  //

  program.command('add [modules...]')
    .description('Add js-kit modules to the project in the current directory. If no module is specified, a user interface will launch.')
    .action(modules => {
      add(`${__dirname}/..`, process.cwd(), modules)
    })

  program.command('run [script]')
    .description('Run a js-kit script on the project on the current directory. If no script is specified, a user interface will launch.')
    .action(script => {
      run(`${__dirname}/..`, process.cwd(), script)
    })

  await program.parseAsync(process.argv)
}
