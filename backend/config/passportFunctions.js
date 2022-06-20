const bcrypt = require('bcrypt');
const Customer = require('../models/Customer');

const verify = (email, password, done) => {
    Customer.findOne({email: email}, (err, customer) => {
        if (err) return err;
        if (!customer) return done(null, false, {'message': 'Invalid email.'});
        bcrypt.compare(password, customer.password, (err, result) => {
            if (err) return err;
            if (!result) return done(null, false, {'message': 'Invalid password.'});
            return done(null, customer);
        })
    })
}

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

const deserializeCustomer = (id, done) => {
    Customer.findById(id, (err, user) => {
        done(err, user);
    })
}

module.exports = {verify, isAuthenticated, deserializeCustomer};