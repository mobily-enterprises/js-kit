const vars = require('../vars')

exports = (err, req, res, next) => {
  // Log the error in the `errors` table
  vars.connection.query('INSERT INTO errors SET name=?, message=?, stackTrace=?', [err.name, err.message, err.stack], (error) => {
    if (error) console.error('UNABLE TO LOG THIS ERROR:', error) /* eslint-disable-line */
  })

  // Set local variables, depending on the env
  res.locals.message = req.app.get('env') === 'development' ? err.message + err.stack : 'There was an error with your request!'
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.httpError || err.status || 500)

  // Send response in the right format (HTML or Json)
  if (req.accepts(['json', 'html']) === 'html') {
    // set locals, only providing error in development
    res.send(`<h1>Error!</h1><pre>${res.locals.message}</pre>`)
  } else {
    res.json({ message: res.locals.message })
    // render the error page
  }
}
module.exports = exports
