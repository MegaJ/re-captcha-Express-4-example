re-captcha [![Build Status](https://secure.travis-ci.org/JacksonTian/re-captcha.png)](http://travis-ci.org/JacksonTian/re-captcha)
======

recaptcha renders and verifies [Recaptcha](http://www.google.com/recaptcha) captchas.

## Purpose
An example to illustrate how to integrate the ```re-captcha``` module for Express 4.x.x and jade. Note that there are many captcha modules that work well with Express. Do not confuse this module with the ```recaptcha``` module (no dash).

Most of this README file is copied from JacksonTian's README, the maintainer of the recaptcha module. As of the time of this writing, the module hasn't been updated for a while and is on version 0.0.3.

I used:
```batch
express -generate <name of my project>
```

to generate a basic scaffold of an application. You will only need to look at ```app.js``` and ```views/index.jade``` for the purposes of this example.

## Setup

Before you can use this module, you must visit http://www.google.com/recaptcha
to request a public and private API key for your domain.

Then run:

```bash
$ npm install
```

## Customizing the Recaptcha

See these [instructions](http://code.google.com/apis/recaptcha/docs/customization.html)
for help customizing the look of Recaptcha.  In brief, you will need to add a
structure like the following before the form in your document:

```
<script>
  var RecaptchaOptions = {
   theme: 'blackglass',
   lang: 'en'
  };
</script>
```

If you want to render the html above with jade:

```jade
script(type='text/javascript').
    var RecaptchaOptions = {
        theme : 'blackglass',
        lang  : 'en'
    };
```

## Example Using Express 4.x.x

app.js:

```javascript
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


// Then routes and error handlers that we don't use

...
...


module.exports = app;


```

views/index.jade:

```jade
extends layout

block content
    script(type='text/javascript').
        // HAS TO BE NAMED "RecaptchaOptions"
        var RecaptchaOptions = {
            theme : 'blackglass',
            lang  : 'en'
        };

    h1= title
    p Welcome to #{title}
    form(method="POST" action="/")
        != reCaptcha_form
        // Don't actually need the value attribute I think
        input(type="submit", value='Check Recaptcha')

```

Make sure you ran 

```bash
$ npm install
```
Then start the server:

```bash
$ npm start
```
