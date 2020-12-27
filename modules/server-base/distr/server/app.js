/* Loaded modules -- start */
const cookieParser = require('cookie-parser')
const express = require('express')
const logger = require('morgan')
const e = require('allhttperrors')
const path = require('path')
/* Loaded modules -- end */

/* Loaded modules -- start */
const errorPageRoute = require('./routes/errorPage')
const vars = require('./vars.js') /*  eslint-disable-line */
const serveStaticFiles = require('./routes/serveStaticFiles.js')
const maybeRedirectToHttps = require('./routes/maybeRedirectToHttps')
const asyncMiddleware = require('./lib/asyncMiddleware')
/* Loaded modules -- end */

// Print unhandled exception if it happens. This will prevent unmanaged
// errors going silent
process.on('unhandledRejection', (err, p) => {
  console.log('UNHANDLED REJECTION!', err, 'PROMISE:', p)
})

/* Before app is created -- start */
/* Before app is created -- end */

const app = express() // Create the express app

/* After app is created -- start */
/* After app is created -- end */

// Ready checker. This allows app.js (this file) to complete async work
// before the server is actually started (in ./www)
app._readyChecker = async () => {
  /* Ready checker -- start */
  /* Ready checker -- end */
  return true
}

/* Express essentials -- start */
app.use(maybeRedirectToHttps) // Redirect to HTTPS for production
app.use(logger()) // Enable the logger
app.use(express.json({ limit: '4mb' })) // Make up request.body, json
app.use(express.urlencoded({ limit: '4mb', extended: false })) // // Make up request.body, urlencoded
app.use(cookieParser()) // Cookie parser
/* Express essentials -- end */

/* Before serving static files -- start */
/* Before serving static files -- end */

// Will serve the app's static files using using es-dev-server (debugging, unbuilt) or
// always serving index.html manually
serveStaticFiles(app)

/* After static files -- start */
/* After static files -- end */

/* App routes -- start */
/* App routes -- 1 */
/* App routes -- 2 */
/* App routes -- 3 */
/* App routes -- end */

// Error handler page. Express will route here when there is an error,
// since errorPageRoute has 4 parameters (err, req, res, next)
app.use(errorPageRoute)

// Artificially call the errorPageRoute as "not found"
app.use((req, res) => errorPageRoute(new e.NotFoundError(), req, res))

module.exports = app
