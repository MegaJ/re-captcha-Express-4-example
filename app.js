var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////// added code after scaffolding ////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

var PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
var PRIVATE_KEY = 'YOUR_PRIVATE_KEY';
var reCaptchaModule = require('re-captcha');

app.get('/', function (req, res) {
    var reCaptcha = new reCaptchaModule(PUBLIC_KEY, PRIVATE_KEY);
    var generatedHTML = reCaptcha.toHTML();

    console.log("this is the recaptcha generated html", generatedHTML );

    res.render('index.jade', {
        layout: false,
        reCaptcha_form: generatedHTML
    }); // end render 
});

app.post('/', function (req, res) {

    //analyze what's given from user
    console.log("This is the req.body: ", req.body);

    //splice data into convenient data JSON
    //will be used by captcha to verify user
    var data = {
        remoteip: req.ip,
        challenge: req.body.recaptcha_challenge_field,
        response: req.body.recaptcha_response_field
    }; // end data JSON

    // initialize reCaptcha so we can use the .verify() method
    var reCaptcha = new reCaptchaModule(PUBLIC_KEY, PRIVATE_KEY);

    // verify captcha
    reCaptcha.verify(data, function (err) {
        if (err) {
            //Redisplay the form, and I'm not sure why we need 
            //this layout value....
            res.render('index.jade', {
                layout: false,
                reCaptcha_form: reCaptcha.toHTML()
            });
        } 
        else {
            res.send('Recaptcha response valid.')
        } // end if/else clauses
    }); // end verify
}); // end POST
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
////////////////////////////// end added lines ////////////////////////////////


app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
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
