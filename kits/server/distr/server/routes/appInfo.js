const vars = require('../vars') /* eslint-disable-line */
const JsonRestStores = require('jsonreststores') /* eslint-disable-line */

// Used so that pages can load /routes/appInfo.js and get a JSON with session info
exports = module.exports = async (req, res, next) => {
  const appInfo = await exports.appInfoGetter(req)
  res.type('application/javascript')
  res.status(200).send('window.APPINFO = ' + JSON.stringify(appInfo))
}

exports.appInfoGetter = async function (req) {
  const config = {
    env: process.env.NODE_ENV
  }

  /* ### APPINFO HERE */

  /* ### END OF APPINFO HERE */

  return config
}
