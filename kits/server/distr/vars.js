const env = process.env.NODE_ENV || 'development'
const config = require(`./envConfig/${env}`)

// If PORT is set, then use it. Services like HEROKU or Amazon will set it for you
if (process.env.PORT) {
  console.log('process.env.PORT set; it will take precedence. Binding to port', process.env.PORT, 'rather than', config.serverPort)
  config.serverPort = process.env.PORT
}

exports = module.exports = {
  connection: null,
  artificialDelay: env === 'development' ? 500 : 0,
  config
}
