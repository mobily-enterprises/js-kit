exports = module.exports = root => (req, res, next) => {
    if ((req.method === 'GET' || req.method === 'HEAD') && req.accepts('html')) {
      res.sendFile('index.html', { root }, err => err && next())
    } else next()
  }
  