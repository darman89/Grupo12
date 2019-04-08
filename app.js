require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const okta = require("@okta/okta-sdk-nodejs");
const session = require("express-session");
var RedisStore = require('connect-redis')(session);
var Redis = require('ioredis');
const { ExpressOIDC } = require('@okta/oidc-middleware');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Queue = require('bull');
var compression = require('compression');
let aws = require('aws-sdk');
var producer = require('sqs-producer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const client = new okta.Client({
  orgUrl: process.env.OKTA_ORG_URL,
  token: process.env.OKTA_TOKEN
});

aws.config.loadFromPath('config.json');

var audioQueue = producer.create({
  queueUrl: 'https://sqs.us-east-2.amazonaws.com/375602021683/audioQueue',
  region: 'us-east-2'
});

app.set('audioQueue', audioQueue);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));


const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
  scope: 'openid profile',
  routes: {
    login: {
      path: "/login"
    },
    callback: {
      path: "/authorization-code/callback",
      defaultRedirect: "/"
    }
  }
});

app.use(session({
  secret: process.env.APP_SECRET,
  resave: true,
  saveUninitialized: false,
  store: new RedisStore({client: new Redis({
    port: 6379,
    host: '192.168.99.100',
    family: 4,
    db: 0
  })})
}));

app.use((req, res, next) => {

  if (!req.userContext) {
    return next();
  }

  client.getUser(req.userContext.userinfo.sub)
      .then(user => {
        req.user = user;
        res.locals.user = user;
        next();
      });
});

app.use(oidc.router);
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
