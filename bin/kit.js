#!/usr/bin/env node
const util = require('util')
const execSync = require("child_process").execSync
const op = process.argv[1]
const p1 = process.argv[2]
const p2 = process.argv[2]

run(...process.argv)

async function run(node, cmd, op, p1, p2, p3) {
  console.error(`op: ${op}, p1: ${p1}`)
  switch (op) {

    case 'add':
      execSync(`npm --no-save install node_modules/js-kit/packages/${p1}`)
      break

    case 'testRun':
      console.error('testRun was here')
      break

    case 'cleanup':
      execSync(`rm ../../../${p1}`)
      break

    case 'init':
      // load package.json
      // run npm install on js-kit.dependencies
      // copy files in distr
      // load js-kit.inserts, make inserts
      // LATER load js-kit.replaces, make replaces
    break
  }
}
