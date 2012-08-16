connect = require('express/node_modules/connect');
console.log(require.resolve('express/node_modules/connect'));

server = connect.createServer().listen(3000);
server.use(testing);


function testing(req,res, next){
  console.log('Req: ' + req.headers);
  next();
}



