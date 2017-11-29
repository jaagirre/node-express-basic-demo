
/*
 This file creates an express application object (named app, by convention), 
sets up the application with various settings and middleware, and then exports
 the app from the module. 
 */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon'); //es un middleware para ofrecer el icono de la web al navegador GET /favicon.ico
var logger = require('morgan'); //HTTP request logger middleware for node.js
var cookieParser = require('cookie-parser'); //cookie parsers
var bodyParser = require('body-parser'); //body parser para pasar a json
var expressValidator = require('express-validator');

//estos js tienen los mapping entre las pèticiones url a codigo 
var index = require('./routes/index'); //agregra los siguients js
var users = require('./routes/users'); //agrega los siguientes js
var catalog = require('./routes/catalog.js');
var app = express();

//aqui va l abase de datos
var mongoose = require('mongoose');
var mongoDBConnectionString =process.env.MONGODB_URI || 'mongodb://jaagirre_dev:EskolaEskola@ds257245.mlab.com:57245/local_library';
mongoose.connect(mongoDBConnectionString, {useMongoClient:true});

var db = mongoose.connection;
db.on('error', function(err){
  console.error.bind(console, 'MongoDB connection error');
});


// view engine setup
//con este comando se estbalce la cual sera la carpeta donde se ubican las plantillas de la vista
app.set('views', path.join(__dirname, 'views'));
//aqui establcemos el motor de vista/plantillas para express, el rqwuire lo hace express internamente
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//aqui le estamos diciendo que utilize el middleware morgan para los logs
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//aqui le decimos que routes vamos a utilizar para que patrone sde peticiones
app.use('/', index);
app.use('/users', users);
app.use('/catalog', catalog);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
