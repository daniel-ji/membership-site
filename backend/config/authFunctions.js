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

const isSelf = (req, res, next) => {
    if (isSelfHelper(req, res, next)) return next();
    res.sendStatus(403);
}

const isSelfHelper = (req, res, next) => {
    return req.isAuthenticated() && (req.user._id.toString() === req.params.id ?? req.body?._id)
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

const isManager = (req, res, next) => {
    if (isManagerHelper(req, res, next)) return next();
    res.sendStatus(403);
}

const isManagerHelper = (req, res, next) => {
    return (req.isAuthenticated() && req.user.type === 'Manager') || isOwnerHelper(req, res, next);
}

const isManagerOrSelf = (req, res, next) => {
    if (isManagerHelper(req, res, next) || isSelfHelper(req, res, next)) return next();
    res.sendStatus(403);
}

// TODO: Remove OWNER_PASSWORD from here after implementing owner
const isOwner = (req, res, next) => {
    if (isOwnerHelper(req, res, next)) return next();
    res.sendStatus(403);
}

const isOwnerHelper = (req, res, next) => {
    return (req.isAuthenticated() && (req.user.type === 'Owner' 
    || req.body.ownerPassword === process.env.OWNER_PASSWORD))
}

const isOwnerOrSelf = (req, res, next) => {
    if (isOwnerHelper(req, res, next) || isSelfHelper(req, res, next)) return next();
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

module.exports = {verify, isAuthenticated, getUserType, isSelf, isManager, isManagerOrSelf, isOwner, isOwnerOrSelf, deserializeUser};