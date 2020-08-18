const originalUrl = require('original-url')
const e = require('allhttperrors')

// Redirect to HTTPS
exports = (req, res, next) => {
  const url = originalUrl(req)
  if (!req.secure && url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
    if (req.method === 'GET') {
      res.redirect(`https://${url.hostname}${url.pathname}${url.search || ''}`)
    } else {
      next(e.NotFoundError)
    }
  } else {
    next()
  }
}
module.exports = exports
