require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
let config= require('./config');
const connection = require("./db");
let moment = require('moment');

const app = express();

///DB CONNETCION////

function mysqlConnect() {
  global.connection = mysql.createConnection(connection);

  global.connection.connect(function (err) {
    if (err) {
      console.log("error when connecting to db");
      setTimeout(mysqlConnect, 2000);
    }
    console.log("connected to database");
  });
  global.connection.on("error", function (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      mysqlConnect();
    } else {
      throw err;
    }
  });
}
mysqlConnect();


///email sender





app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use(cookieParser(config.cookieSecret));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next)=>{
  res.locals.moment = moment;
  next();
});
/// Routes Get
const pagesGet = require("./routes/pagesGet");
app.use(pagesGet)

/// Routes Post
const pagesPost = require("./routes/pagesPost");
app.use(pagesPost)

// Routes admin
const admin = require("./routes/adminsRoutes");
app.use('/admin-panel-controll/',admin);

app.use( (req, res) => {
  //render page not found 
  res.redirect('/')
})

// let transfer = require("./controllers/transferBD");

// transfer.transferMeters() 

/// telegram bot

let telegramBot = require('./telegramBot/telBot').botStart();


app.listen(process.env.PORT || 5000, async () => {
    console.log('Server running on port', process.env.PORT || 5000)
})







 




