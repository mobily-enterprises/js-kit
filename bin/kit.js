#!/usr/bin/env node
// const execSync = require('child_process').execSync
const fs = require('fs')
const path = require('path')
const pkgUp = require('pkg-up')

// This is a module-wide variable. It will be set on run(),
// since it's an async function
run(...process.argv)

async function run (node, cmd, op, p1, p2, p3) {
  let dstPackageJsonChanged = false

  let dstPath = await pkgUp()
  if (!dstPath) {
    console.error('ERROR: destination module not found')
  }
  const dstPackageJson = require(dstPath)
  console.log('Kitting up package:', dstPackageJson.name)
  dstPath = path.dirname(dstPath)

  switch (op) {
    case 'add':
      installKit(p1)
      break
  }

  // If the package.json has changed (checked with a flag), will
  // overwrite it with the new data
  if (dstPackageJsonChanged) {
    console.log('Committing changes to package.json for ' + dstPackageJson.name)
    await fs.writeFileSync(path.join(dstPath, 'package.json'), JSON.stringify(dstPackageJson, null, 2))
  }

  async function installKit (kitName) {
    const kitDir = `${__dirname}/../kits/${kitName}`
    const kitInstallFile = `${__dirname}/../installed/${kitName}`

    // Check if kit is available
    if (!isDir(kitDir)) {
      console.log(`FATAL: Kit not found: ${kitName}`)
      process.exit(1)
    }

    // Check if kit is already installed
    if (fs.existsSync(kitInstallFile)) {
      console.log(`${kitName} already installed, skipping...`)
      return
    }

    // Install dependendencies first
    const kitPackageJson = require(`${kitDir}/kit.json`)
    const deps = kitPackageJson.kitDependencies || []
    if (deps.length) console.log('This module has dependencies. Installing them.', deps)
    for (const kitName of deps) {
      installKit(kitName)
    }
    if (deps.length) console.log('Dependencies installed.', deps)

    // Actually installing the kit!
    console.log('Installing:', kitName)

    // STEP #1: copy files over
    if (isDir(`${kitDir}/distr`)) {
      console.log('"distr" folder found, copying files over')
      copyRecursiveSync(`${kitDir}/distr`, dstPath, true)
    }

    // STEP #1: copy files over
    if (isDir(`${kitDir}/distr-opt`)) {
      console.log('"distr-opt" folder (optional files) found, copying files over')
      copyRecursiveSync(`${kitDir}/distr-opt`, dstPath, false)
    }

    // STEP #2: dd npmDependencies to package.json (if not there already)
    // Just modify dstPackageJson
    let dstNpmDependencies
    if (typeof dstPackageJson.dependencies === 'undefined') {
      dstNpmDependencies = dstPackageJson.dependencies = {}
    } else {
      dstNpmDependencies = dstPackageJson.dependencies
    }
    const kitNpmDependencies = kitPackageJson.npmDependencies || {}
    for (const depName in kitNpmDependencies) {
      if (typeof dstNpmDependencies[depName] === 'undefined') {
        console.log('Adding npm dependency: ' + depName)
        dstNpmDependencies[depName] = kitNpmDependencies[depName]
        dstPackageJsonChanged = true
      } else {
        console.log('Non adding npm dependency as it was already there: ' + depName)
      }
    }

    // STEP #2a: Repeat the above for devDependencies
    // Note: make code generic

    // STEP $3: make requested inserts in destination files

    // Mark it as installed in metadata (create lock file)
    fs.writeFileSync(kitInstallFile, kitPackageJson.version)

    // Kit installed!
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

  function copyRecursiveSync (src, dest, force = true) {
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
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), force)
      }
    } else {
      // MAYBE rename original file
      const exists = fs.existsSync(dest)
      const dstStats = exists && fs.statSync(dest)

      // File already exists: only copy it if it's required
      if (exists && dstStats.isFile()) {
        if (force) {
          console.log(`${dest} already there, copying required, making a backup`)
          const now = new Date()
          const backupFileName = dest + '.' + now.getFullYear() + '-' + String(now.getMonth()).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
          fs.renameSync(dest, backupFileName)
          fs.copyFileSync(src, dest)
        } else {
          console.log(`${dest} already there, copying not required, skipping`)
        }

      // File does not exist: copy it regardless
      } else {
        fs.copyFileSync(src, dest)
      }
    }
  }
}
