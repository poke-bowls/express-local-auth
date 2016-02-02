var express = require( 'express' );
var app = express();
var bodyParser = require( 'body-parser' );
var passport = require( 'passport' );
var session = require('express-session');
var LocalStrategy = require( 'passport-local').Strategy;
var CONFIG =require( './config' );

app.set('views', 'views');
app.set('view engine', 'jade');

app.use(bodyParser.urlencoded({extended: false}));

//Add optional secret key to our session
app.use(session(CONFIG.SESSION));

//Initialize passport project in Express
app.use(passport.initialize());

//set passport session middleware to persist login sessions
app.use(passport.session());

//in order to maintain persistent login session, the authenticated user must be serialized
//to the session. The user will be deserialized when each subsequent request is made.
passport.serializeUser(function (user, done){
  //user is passed in from Local Strategy
  //user is attached to req.user
  return done(null, user);
});

passport.deserializeUser(function (user, done){
  return done(null, user);
});

passport.use( new LocalStrategy(
  function (username, password, done) {
    var isAuthenticated = authenticate(username, password);
    if (!isAuthenticated) {// Not authenticated
      return done(null, false); //No error, but credentials dont match
    }

    var user = {
      name : 'Bob',
      role : 'ADMIN',
      color : 'green'
    };
    return done(null, user); //Authenticated
  }
));

app.get('/', function (req, res){
  res.redirect('/login');
});

app.route('/login')

  .get(function (req, res){
    res.render('login');
  })

  .post(passport.authenticate('local', {
    successRedirect : '/secret',
    failureRedirect : '/login'
}));

app.get('/secret', isAuthenticated, function (req, res){
  res.render('secret', {role : req.user.role.toLowerCase()});
});

app.get('/logout', function (req, res){
  req.logout();
  res.render('login');
});

function authenticate(username, password) {
  var CREDENTIALS = CONFIG.CREDENTIALS;
  var USERNAME = CREDENTIALS.USERNAME;
  var PASSWORD = CREDENTIALS.PASSWORD;

  return (username === USERNAME && password === PASSWORD);
}

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  return next();
}

var server = app.listen(CONFIG.PORT, function(){
  console.log('Listening on port:', server.address().port);
});