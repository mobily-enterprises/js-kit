const fs = require('fs')

const env = process.env.NODE_ENV || 'development'
const config = JSON.parse(fs.readFileSync(`${__dirname}/envConfig/${env}.json`, 'utf8')) /* eslint-disable-line */

// If PORT is set, then use it. Services like HEROKU or Amazon will set it for you
if (process.env.PORT) {
  console.log('process.env.PORT set; it will take precedence. Binding to port', process.env.PORT, 'rather than', config.serverPort) /* eslint-disable-line */
  config.serverPort = process.env.PORT
}

exports = {
  connection: null,
  artificialDelay: env === 'development' ? 500 : 0,
  config
}

module.exports = exports
