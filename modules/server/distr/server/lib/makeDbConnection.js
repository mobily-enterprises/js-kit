const mysql = require('mysql')
const { promisify } = require('util')

exports = (config) => {
  // Create a pool based on the passed config
  const ret = mysql.createPool({
    host: config.dbHost,
    database: config.db,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword
  })

  // Promisify async methods, to make this module less painful to use
  for (const method of ['getConnection', 'acquireConnection', 'end', 'query']) {
    ret[`${method}P`] = promisify(ret[method])
  }
  return ret
}

module.exports = exports
