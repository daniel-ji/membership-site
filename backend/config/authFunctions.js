const bcrypt = require('bcrypt');

const Owner = require('../models/users/Owner');
const Manager = require('../models/users/Manager');
const Customer = require('../models/users/Customer');

const dotenv = require('dotenv');

dotenv.config();

const verify = (req, username, password, done) => {
    getUserType(req.params.type).findOne({ $or: [{username: username}, {phone: username}]}, (err, user) => {
        if (err) return err;
        if (!user) return done(null, false, {'message': 'Invalid username.'});
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) return err;
            if (!result) return done(null, false, {'message': 'Invalid password.'});
            if (user.active === false) return done(null, false, {'message': 'Account not verified.'});
            return done(null, user);
        })
    })
}

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

const getUserType = (type) => {
    switch (type.toLowerCase()) {
        case 'manager':
            return Manager;
        case 'owner':
            return Owner;
        case 'customer':
        default: 
            return Customer;
    }
}

const isAuthorizedManager = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'Manager') return next();
    res.sendStatus(403);
}

// TODO: Remove OWNER_PASSWORD from here after implementing owner
const isOwner = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type === 'Owner' || req.body.ownerPassword === process.env.OWNER_PASSWORD) return next();
    res.sendStatus(403);
}

const deserializeUser = (id, done) => {
    Customer.findById(id, (err, user) => {
        if (user !== null) {
            done(err, user);
        } else {
            Manager.findById(id, (err, user) => {
                done(err, user);
            })
        }
    })
}

module.exports = {verify, isAuthenticated, getUserType, isAuthorizedManager, isOwner, deserializeUser};