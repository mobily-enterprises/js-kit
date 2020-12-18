const fs = require('fs')
const express = require('express')
const esDevServer = require('es-dev-server') /* eslint-disable-line */
const Koa = require('koa')
const vars = require('../vars')

exports = (app) => {
  function safeConfigOutput (o) {
    const oCopy = { ...o }
    if (oCopy.db) delete oCopy.db.dbPassword
    return oCopy
  }

  const serveBuilt = process.env.SERVE_BUILT

  // Show what environment is running
  console.log('Running application as:', process.env.NODE_ENV || 'development') /* eslint-disable-line */
  console.log('Config:\n', safeConfigOutput(vars.config)) /* eslint-disable-line */

  // Serve the built version EITHER if it's a non-dev environments OR if serveBuilt is set
  if (serveBuilt) {
    const root = 'server/dist'
    app.use(express.static(root))
    app.use((req, res, next) => {
      if ((req.method === 'GET' || req.method === 'HEAD') && req.accepts('html')) {
        res.sendFile('index.html', { root }, err => err && next())
      } else next()
    })

    // Serve the local unbuilt directory using Polyserve as a module
  } else {
    if (fs.existsSync('distributed')) {
      console.error('ERROR: cannot serve unbuilt directory from distributed environment') /* eslint-disable-line */
      process.exit(99)
    }

    const config = esDevServer.createConfig({
      nodeResolve: true,
      appIndex: 'index.html',
      moduleDirs: ['node_modules'],
      preserveSymlinks: true,
      watch: true
    })
    const middlewares = esDevServer.createMiddlewares(config)
    const koaApp = new Koa()
    middlewares.forEach(middleware => {
      koaApp.use(middleware)
    })

    app.use(koaApp.callback())
  }
}
module.exports = exports
