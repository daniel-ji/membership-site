const express = require('express');
const session = require('express-session');

// passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// defaults
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// protection
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

require('dotenv').config();

const authFunctions = require('./config/authFunctions'); 

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

// Express-Mongo-Sanitize
app.use(mongoSanitize());

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
app.use(logger('dev'));

app.use(express.json());
app.use((err, req, res, next) => {
    if (err) {
        res.sendStatus(400)
    } else {
        next();
    }
})
// app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(authFunctions.deserializeCustomer)

passport.use(new LocalStrategy(authFunctions.verify))

// Routes
app.use('/', indexRouter);
app.use('/api/customers', customersRouter);

module.exports = app;