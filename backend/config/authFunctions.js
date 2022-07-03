const bcrypt = require('bcrypt');
const Customer = require('../models/users/Customer');

const verify = (username, password, done) => {
    Customer.findOne({ $or: [{username: username}, {phone: username}]}, (err, customer) => {
        if (err) return err;
        if (!customer) return done(null, false, {'message': 'Invalid email.'});
        bcrypt.compare(password, customer.password, (err, result) => {
            if (err) return err;
            if (!result) return done(null, false, {'message': 'Invalid password.'});
            if (customer.active === false) return done(null, false, {'message': 'Account not verified.'});
            return done(null, customer);
        })
    })
}

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

const isAuthorizedManager = (req, res, next) => {
    if (req.user.type === 'Manager') return next();
    res.sendStatus(403);
}

const deserializeCustomer = (id, done) => {
    Customer.findById(id, (err, user) => {
        done(err, user);
    })
}

module.exports = {verify, isAuthenticated, isAuthorizedManager, deserializeCustomer};