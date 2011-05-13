var util = require('util')
  , Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server

  // Mongo Console 
  // mongo flame.mongohq.com:27101/hakeru -u <user> -p<password>
  // Mongo URI 
  // mongodb://dtrejo:hakerurocks@flame.mongohq.com:27101/hakeru
  // 'localhost', 27101

  , mongo = new Db('hakeru', new Server('flame.mongohq.com', 27101, {}))
  ;

// Start server connection.
mongo.open(handleMongoOpen);
function handleMongoOpen(err, c) {
  mongo.authenticate('dtrejo', 'hakerurocks',  handleMongoAuthenticate);
} 

function handleMongoAuthenticate(err, c) {
  if (err) throw err;
  // console.log(util.inspect(c, true, false));
  console.log(c);
}