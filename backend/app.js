const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');

const connectDB = require('./config/mongoDB');

const indexRouter = require('./routes/index');
const customersRouter = require('./routes/customer');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};


app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/customers', customersRouter);

module.exports = app;
