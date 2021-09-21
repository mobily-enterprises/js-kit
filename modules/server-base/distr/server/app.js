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
const maybeRedirectToHttps = require('./routes/maybeRedirectToHttps')
const asyncMiddleware = require('./lib/asyncMiddleware')
const moduleMiddleware = require('es6-dev-server').moduleMiddleware
const alwaysIndex = require('./routes/alwaysIndex')
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
logger.token('headers', function (req) { return JSON.stringify(req.headers) })
logger.token('body', function (req) { return JSON.stringify(req.body) })
app.use(logger(':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :headers :body')) // Enable the logger
app.use(express.json({ limit: '4mb' })) // Make up request.body, json
app.use(express.urlencoded({ limit: '4mb', extended: false })) // // Make up request.body, urlencoded
app.use(cookieParser()) // Cookie parser
/* Express essentials -- end */

/* Before serving static files -- start */
/* Before serving static files -- end */

// Important server variables
const serveBuilt = process.env.SERVE_BUILT
const env = process.env.NODE_ENV || 'development'
const root = serveBuilt ? 'server/dist' : path.join(__dirname, '..')

// Run module resolution for local (unbuilt) files
// (Unless it's set to serve the built version, which would render this useless)
if (!serveBuilt) app.use(moduleMiddleware({ root }))

// Serve static files
app.use(express.static(root))

/* After static files -- start */
/* After static files -- end */

/* App routes -- start */
/* App routes -- 1 */
/* App routes -- 2 */
/* App routes -- 3 */
/* App routes -- end */

// Always serve index.html
app.use(alwaysIndex(root))

// Artificially call the errorPageRoute as "not found"
// This will never happen for GET or HEAD, but might happen for the
// rest of it
app.use((req, res) => errorPageRoute(new e.NotFoundError(), req, res))

// Error handler page. Express will route here when there is an error,
// since errorPageRoute has 4 parameters (err, req, res, next)
app.use(errorPageRoute)

module.exports = app
