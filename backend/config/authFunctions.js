/**
 * Various authentication and authorization functions for login, users, etc.
 */

const bcrypt = require('bcrypt');

const Executive = require('../models/users/Executive');
const Manager = require('../models/users/Manager');
const Customer = require('../models/users/Customer');

const dotenv = require('dotenv');
dotenv.config();

/**
 * Passport.js authentication strategy function.
 * 
 * @param {Object} req http request object 
 * @param {String} username login username (either email or password)
 * @param {String} password login password
 * @param {Callback} done callback function
 */
const verify = (req, username, password, done) => {
    getUserType(req.params.type).findOne({ $or: [{username: username}, {phone: username}]}, {password: 1}, (err, user) => {
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

/**
 * Passport.js user deserialization function.
 * 
 * @param {String} id MongoDB user id 
 * @param {Callback} done 
 */
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

/**
 * Returns MongoDB model based on user type.
 * 
 * @param {String} type user type - Executive, Manager, Customer 
 * @returns {Object} MongoDB model - Executive, Manager, Customer
 */
 const getUserType = (type) => {
    switch (type.toLowerCase()) {
        case 'manager':
            return Manager;
        case 'executive':
            return Executive;
        case 'customer':
        default: 
            return Customer;
    }
}

/**
 * Middleware function for checking if session contains authenticated user.
 * 
 * @param {Object} req http request object 
 * @param {Object} res http response object
 * @param {Callback} next callback function
 * @returns Unauthorized if user is not authenticated
 */
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

/**
 * Middleware function (usually for updating user data). 
 * 
 * @returns Forbidden if user is not authorized to access function 
 */
const isSelf = (req, res, next) => {
    if (isSelfHelper(req, res, next)) return next();
    res.sendStatus(403);
}

/**
 * 
 * @returns {Boolean} true if user is the owner of the data being modified.
 */
const isSelfHelper = (req, res, next) => {
    return req.isAuthenticated() && (req.user._id.toString() === req.params.id ?? req.body?._id)
}

/** Middleware function. 
 * 
 * @returns Forbidden if current session is not a customer.
*/
const isCustomer = (req, res, next) => {
    if (isCustomerHelper(req, res, next)) return next();
    res.sendStatus(403);
}

const isCustomerHelper = (req, res, next) => {
    return (req.isAuthenticated() && req.user.type === 'Customer')
}

/**
 * Middleware function.
 * 
 * @returns Forbidden if current session is not a manager. 
 */
const isManager = (req, res, next) => {
    if (isManagerHelper(req, res, next)) return next();
    res.sendStatus(403);
}

/**
 * 
 * @returns {Boolean} true if user is a manager or executive.
 */
const isManagerHelper = (req, res, next) => {
    return (req.isAuthenticated() && req.user.type === 'Manager') || isExecutiveHelper(req, res, next);
}

/**
 * Middleware function (usually for updating user data).
 *
 * @returns Forbidden if current session is not a manager, executive, or owner of data being modified.
 */
const isManagerOrSelf = (req, res, next) => {
    if (isManagerHelper(req, res, next) || isSelfHelper(req, res, next)) return next();
    res.sendStatus(403);
}

/**
 * Middleware function.
 * 
 * @returns Forbidden if current session is not an executive.  
 */
const isExecutive = (req, res, next) => {
    console.log(isExecutiveHelper(req, res, next));
    if (isExecutiveHelper(req, res, next)) return next();
    res.sendStatus(403);
}

/**
 * 
 * @returns {Boolean} true if user is an executive.
 */
// TODO: Remove EXECUTIVE_PASSWORD from here after implementing executive
const isExecutiveHelper = (req, res, next) => {
    return (req.isAuthenticated() && (req.user.type === 'Executive' 
    || req.body.executivePassword === process.env.EXECUTIVE_PASSWORD))
}

/**
 * Middleware function.
 * 
 * @returns Forbidden if current session is not an executive or owner of data being modified. 
 */
const isExecutiveOrSelf = (req, res, next) => {
    if (isExecutiveHelper(req, res, next) || isSelfHelper(req, res, next)) return next();
    res.sendStatus(403);
}

module.exports = {verify, isAuthenticated, getUserType, isSelf, isCustomer, isManager, isManagerOrSelf, isExecutive, isExecutiveOrSelf, deserializeUser};