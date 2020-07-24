#!/usr/bin/env node
// const execSync = require('child_process').execSync
const fs = require('fs')
const copy = require('recursive-copy')

run(...process.argv)

async function run (node, cmd, op, p1, p2, p3) {
  switch (op) {
    case 'add':
      installKit(p1)
      break
  }
}

async function installKit (kitName) {
  const kitDir = `${__dirname}/../kits/${kitName}`
  const kitInstallFile = `${__dirname}/../installed/${kitName}`

  if (!isDir(kitDir)) {
    console.log(`FATAL: Kit not found: ${kitName}`)
    process.exit(1)
  }

  console.log('Installing:', kitName)
  if (fs.existsSync(kitInstallFile)) {
    console.log(`${kitName} already installed, skipping...`)
    return
  }

  const kjson = require(`${kitDir}/kit.json`)
  const deps = kjson.kitDependencies || []
  if (deps.length) {
    console.log('This module has dependencies. Installing them.', deps)
  }
  for (const kitName of deps) {
    installKit(kitName)
  }

  // Install this kit

  if (isDir(`${kitDir}/distr`)) {
    console.log('distr folder found, copying files over')
    console.log(process.env, __dirname)
    // await copy(`${kitDir}/distr`,

  }

  // Install it
  //   copy files in distr
  //   add npmDependencies to package.json (if not there already)
  //   load js-kit.inserts, make inserts

  // Mark it as installed in metadata (create lock file)
  fs.writeFileSync(kitInstallFile, kjson.version)
  console.log('kit installed:', kitName)
}

function isDir (path) {
  try {
    // Query the entry
    const stats = fs.lstatSync(path)
    if (stats.isDirectory()) return true
    return false
  }
  catch (e) {
    if (e.code === 'ENOENT') return false
    throw e
  }
}
