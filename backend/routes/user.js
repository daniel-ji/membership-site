/**
 * user.js contains the shared routes for all users - customers, managers, and executives
 */

const express = require('express');
const router = express.Router();

const passport = require('passport');

const dotenv = require('dotenv');
dotenv.config();

const authFunctions = require('../config/authFunctions');

/**
 * GET logged in status.
 * 
 * Authorized Users: Everyone
 */
router.get('/loggedin', authFunctions.isAuthenticated, (req, res) => {
    res.status(200).json({loggedIn: true, type: req.user.type});
});

/** 
 * GET user information.
 * 
 * Authorized Users: Customers, Managers, Executives
 */
router.get('/self', authFunctions.isAuthenticated, (req, res, next) => {
    authFunctions.getUserType(req.user.type)
    .findOne({"_id": req.user._id.toString()}).exec().then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.sendStatus(500);
        })
})

/** 
 * POST login request.
 * 
 * Authorized Users: Everyone
 */
router.post('/login/:type', passport.authenticate('local', {successMessage: 'Logged in.', failureMessage: 'Failed to log in.'}), (req, res) => {
    if (req.user) {
        res.status(200).json({'success': 'Logged in.'})
    } else {
        res.status(401);
    }
})

/**
 * POST logout request.
 * 
 * Authorized Users: Everyone
 */
router.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        if (process.env.NODE_ENV === "DEVELOPMENT") {
            res.sendStatus(200);
        } else {
            res.redirect('/');
        }
    })
})

module.exports = router;