#!/usr/bin/env node
// const execSync = require('child_process').execSync
const fs = require('fs')
const path = require('path')

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

  if (fs.existsSync(kitInstallFile)) {
    console.log(`${kitName} already installed, skipping...`)
    return
  }

  const kjson = require(`${kitDir}/kit.json`)
  const deps = kjson.kitDependencies || []
  if (deps.length) console.log('This module has dependencies. Installing them.', deps)

  for (const kitName of deps) {
    installKit(kitName)
  }
  if (deps.length) console.log('Dependencies installed.', deps)

  console.log('Installing:', kitName)

  // Install this kit

  if (isDir(`${kitDir}/distr`)) {
    console.log('"distr" folder found, copying files over')
    copyRecursiveSync(`${kitDir}/distr`, '.')
  }

  // Install it
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

function copyRecursiveSync (src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    try {
      fs.mkdirSync(dest)
    } catch (e) {
      if (e.code !== 'EEXIST') throw e
    }
    for (const childItemName of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    }
  } else {
    // MAYBE rename original file
    const exists = fs.existsSync(dest)
    const dstStats = exists && fs.statSync(dest)
    const isFile = exists && dstStats.isFile()
    if (isFile) {
      console.log(`${dest} already there, making a backup`)
      const now = new Date()
      const backupFileName = dest + '.' + now.getFullYear() + '-' + String(now.getMonth()).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
      fs.renameSync(dest, backupFileName)
    }

    fs.copyFileSync(src, dest)
  }
}
