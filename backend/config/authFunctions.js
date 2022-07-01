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

const deserializeCustomer = (id, done) => {
    Customer.findById(id, (err, user) => {
        done(err, user);
    })
}

const isObjectStrict = (...values) => {
    let result = true;
    values.forEach(value => {
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
            result = false;
        }
    })
    return result;
}

module.exports = {verify, isAuthenticated, deserializeCustomer, isObjectStrict};