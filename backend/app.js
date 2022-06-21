const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const passportFunctions = require('./config/passportFunctions'); 

const indexRouter = require('./routes/index');
const customersRouter = require('./routes/customer');

const Customer = require('./models/users/Customer');

const app = express();

/** Middleware */ 

// Helmet
app.use(helmet());

// CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};
app.use(cors(corsOptions));

// Express-Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}))

// Default Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(passportFunctions.deserializeCustomer)

passport.use(new LocalStrategy(passportFunctions.verify))

// Routes
app.use('/', indexRouter);
app.use('/api/customers', customersRouter);

module.exports = app;