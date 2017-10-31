var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var hbs = require('hbs')

var MongoClient = require('mongodb').MongoClient;

var index = require('./routes/index');

var app = express();

var db_url = process.env.MONGO_URL;

// console.log(db_url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'top secret', resave: false, saveUninitialized: false}));
app.use(flash());

MongoClient.connect(db_url).then( (db) => {

    // console.log(db);

    var tasks = db.collection('tasks');
    // console.log(tasks);
    // console.log(tasks.find());

    app.use('/', function(req, res, next) {
        req.tasks = tasks;
        next();
    });

    app.use('/', index);

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

}).catch((err) => {
    console.log('Error connecting to MongoDB\n', err);
    process.exit(-1);
});

module.exports = app;
