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
const hpp = require('hpp');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

require('dotenv').config();

const authFunctions = require('./config/authFunctions'); 

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const customerRouter = require('./routes/customer');
const managerRouter = require('./routes/manager');
const commentRouter = require('./routes/comment');

const app = express();

/** Middleware */ 

// Helmet
app.use(helmet());
// HPP
app.use(hpp());

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

passport.deserializeUser(authFunctions.deserializeUser)

passport.use(new LocalStrategy({passReqToCallback: true}, authFunctions.verify))

// Routes
app.use('/', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/customer', customerRouter);
app.use('/api/manager', managerRouter);
app.use('/api/comment', commentRouter);

module.exports = app;