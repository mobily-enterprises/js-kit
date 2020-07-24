#!/usr/bin/env node
const execSync = require('child_process').execSync
const fs = require('fs')

run(...process.argv)

async function run (node, cmd, op, p1, p2, p3) {
  console.error(`op: ${op}, p1: ${p1}`)
  switch (op) {
    case 'add':
      installKit(p1)
      break

    case 'testRun':
      console.error('testRun was here')
      break

    case 'cleanup':
      execSync(`rm ../../../${p1}`)
      break
  }
}

function installKit (kitName) {
  console.log('Installing:', kitName)
  if (fs.existsSync(`${__dirname}/../installed/${kitName}`)) {
    console.log(`${kitName} already installed, skipping...`)
    return
  }

  const kjson = require(`${__dirname}/../kits/${kitName}/kit.json`)
  const deps = kjson.kitDependencies || []
  if (deps.length) {
    console.log('This module has dependencies. Installing them.', deps)
  }
  for (const kitName of deps) {
    installKit(kitName)
  }

  // Install this kit

  // Check that kit is not already installed (check lock file)
  // Install it
  //   copy files in distr
  //   add npmDependencies to package.json (if not there already)
  //   load js-kit.inserts, make inserts

  // Mark it as installed in metadata (create lock file)
  fs.writeFileSync(`${__dirname}/../installed/${kitName}`, kjson.version)
  console.log('kit installed:', kitName)
}
