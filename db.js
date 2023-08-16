let conf = require('./config')
var connection = {
    host     : conf.hostDB,
    user     : conf.userDB,
    password : conf.passwordDB,
    database : conf.databaseDB,
    charset: "utf8"
  };
   
  module.exports = connection;
  