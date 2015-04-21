//
// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
// 
//   Author Binu P. Ramakrishnan
//   Created 01/05/2015


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('express-busboy');
//var bodyParser = require('body-parser');

var routes = require('./routes/index');
var app = express();

// A workaround to process CSP report from chrome.
// Chrome uses separate content-type for sending CSP
// reports which is not working well with express-busboy
// The workaround is to intercept the request and
// replace the content-type with app/json and pass it
// to express-busboy. 
// Note the order is important. ie this function should 
// be placed before busboy bodyParser extend.
app.post('/report/:id', function(req, res, next) {
  req.headers['content-type'] = 'application/json';
  next();
});

//bodyParser.extend(app);
bodyParser.extend(app, {
   limits: {
     fieldSize: 10 * 1024 * 1024
   }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
//app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/resources', express.static(path.join(__dirname, 'webkit-tests/resources')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: "DEV " + err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
