var connect = require('connect');
var urlparser = require('url');


exports = module.exports = function(){

  return  function (req, res, next) {
  url = req.urlp = urlparser.parse(req.url, true);

  // Logout
  if ( url.pathname == "/logout" ) {
    req.session.destroy();
  }

  // Is User already validated?
  if (req.session && req.session.auth == true) {
    next(); // stop here and pass to the next onion ring of connect
    return;
  }

  // ########
  // Auth - Replace this example with your Database, Auth-File or other things
  // If Database, you need a Async callback...
  if ( url.pathname == "/login" && 
       url.query.name == "max" && 
       url.query.pwd == "herewego"  ) {
    req.session.auth = true;
    next();
    return;
  }

  // ####
  // This user is not authorized. Stop talking to him.
  res.writeHead(403);
  res.end('Sorry you are not authorized.\n\nFor a login use: /login?name=max&pwd=herewego');
  return;
}

