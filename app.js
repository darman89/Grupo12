require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const okta = require("@okta/okta-sdk-nodejs");
const session = require("express-session");
const RedisStore = require('connect-redis')(session);
const Redis = require('ioredis');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const aws = require('aws-sdk');
const producer = require('sqs-producer');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

const client = new okta.Client({
  orgUrl: process.env.OKTA_ORG_URL,
  token: process.env.OKTA_TOKEN
});

//aws.config.loadFromPath('config.json');
aws.config.region = `${process.env.AWS_SECRET_REGION}`;

const audioQueue = producer.create({
  queueUrl: `${process.env.AWS_SQS_URL}`,
  region: `${process.env.AWS_SQS_REGION}`
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
  store: new RedisStore({client: new Redis(`${process.env.REDIS_URL}`)})
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
