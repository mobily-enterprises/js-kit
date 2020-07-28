const fs = require('fs')
const vars = require('./vars')
const express = require('express')
const esDevServer = require('es-dev-server')

exports = module.exports = function (app) {
  function safeConfigOutput (o) {
    o = { ...o }
    delete o.db.dbPassword
    return o
  }

  const serveBuilt = process.env.SERVE_BUILT

  // Show what environment is running
  console.log('Running application as:', process.env.NODE_ENV || 'development')
  console.log('Config:\n', safeConfigOutput(vars.config))

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
      console.error('ERROR: cannot serve unbuilt directory from distributed environment')
      process.exit(99)
    }

    const Koa = require('koa')
    const config = esDevServer.createConfig({
      nodeResolve: true,
      appIndex: 'index.html',
      moduleDirs: ['node_modules'],
      preserveSymlinks: true
    })
    const middlewares = esDevServer.createMiddlewares(config)
    const koaApp = new Koa()
    middlewares.forEach(middleware => {
      koaApp.use(middleware)
    })

    app.use(koaApp.callback())
  }
}
