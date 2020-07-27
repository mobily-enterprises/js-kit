#!/usr/bin/env node
// const execSync = require('child_process').execSync
const fs = require('fs')
const path = require('path')
const pkgUp = require('pkg-up')
const replaceInFile = require('replace-in-file')

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
    const kitPath = `${__dirname}/../kits/${kitName}`
    const kitInstallFile = `${__dirname}/../installed/${kitName}`

    // Check if kit is available
    if (!isDir(kitPath)) {
      console.log(`FATAL: Kit not found: ${kitName}`)
      process.exit(1)
    }

    // Check if kit is already installed
    if (fs.existsSync(kitInstallFile)) {
      console.log(`${kitName} already installed, skipping...`)
      return
    }

    // Install dependendencies first
    const kitPackageJson = require(`${kitPath}/kit.json`)
    const deps = kitPackageJson.kitDependencies || []
    if (deps.length) console.log('This module has dependencies. Installing them.', deps)
    for (const kitName of deps) {
      installKit(kitName)
    }
    if (deps.length) console.log('Dependencies installed.', deps)

    // Actually installing the kit!
    console.log('Installing:', kitName)

    // STEP #1: copy files over
    if (isDir(`${kitPath}/distr`)) {
      console.log('"distr" folder found, copying files over')
      copyRecursiveSync(`${kitPath}/distr`, dstPath, true)
    }

    // STEP #1: copy files over
    if (isDir(`${kitPath}/distr-opt`)) {
      console.log('"distr-opt" folder (optional files) found, copying files over')
      copyRecursiveSync(`${kitPath}/distr-opt`, dstPath, false)
    }

    // Add dependencies and devDependencies
    dstPackageJsonChanged = copyKeys(kitPackageJson, 'npmDependencies', dstPackageJson, 'dependencies') || dstPackageJsonChanged
    dstPackageJsonChanged = copyKeys(kitPackageJson, 'npmDevDependencies', dstPackageJson, 'devDependencies') || dstPackageJsonChanged

    // Carry ong requested inserts in destination files
    const inserts = kitPackageJson.inserts || []
    for (const insert of inserts) {
      const point = insert.point
      const file = insert.file
      const contents = fs.readFileSync(path.join(kitPath, 'inserts', insert.contents))

      await replaceInFile({
        files: path.join(dstPath, file),
        from: point,
        to: point + '\n' + contents
      })
      console.log(`Contents of ${insert.contents} added to injectionj point in ${file}`)
    }

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

  function copyKeys (src, srcProp, dst, dstProp) {
    let changed = false
    let dstObject
    if (typeof dst[dstProp] === 'undefined') {
      dstObject = dst[dstProp] = {}
    } else {
      dstObject = dst[dstProp]
    }
    const srcObject = src[srcProp] || {}

    for (const key in srcObject) {
      if (typeof dstObject[key] === 'undefined') {
        console.log(`Adding key to ${dstProp}: ${key}`)
        dstObject[key] = srcObject[key]
        changed = true
      } else {
        console.log(`Non adding key ${key} in ${dstProp} as it was already there`)
      }
    }
    return changed
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
