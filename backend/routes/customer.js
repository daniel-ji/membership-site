const express = require('express');
const router = express.Router();
const path = require('path');

const ejs = require('ejs');
const transporter = require('../config/nodemailer');

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');

const mongoose = require('mongoose'); 
const validator = require('validator');
const dotenv = require('dotenv');

dotenv.config();

const authFunctions = require('../config/authFunctions');

const Customer = require('../models/users/Customer');

/* GET logged in or not */
router.get('/loggedin', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({loggedIn: true});
    } else {
        res.status(401).json({loggedIn: false});
    }
});

/* GET verify customer signup */
router.get('/verify/:token', (req, res) => {
    Customer.findOne({verifyToken: req.params.token}, (err, customer) => {
        if (err) {
            res.status(500).json({'error': 'Internal server error'});
        } else if (!customer) {
            res.status(404).json({error: 'Customer not found'});
        } else {
            customer.active = true;
            customer.verifyToken = undefined;
            customer.save((err) => {
                if (err) {
                    res.status(500).json({'error': 'Internal server error'});
                } else {
                    res.status(200).json({'success': 'Customer verified'});
                }
            });
        }
    });
})

/* GET own customer information (if currently logged in as a customer) */
router.get('/self', authFunctions.isAuthenticated, (req, res, next) => {
    Customer.findOne({"_id": req.user._id.toString()}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/* GET customer based on Object Id */
router.get('/one/:id', authFunctions.isAuthenticated, (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {        
        Customer.findOne({"_id": mongoose.Types.ObjectId(req.params.id)}).exec().then(result => {
            res.status(200).json(result);
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        })
    } else {
        res.sendStatus(400);
    }
}) 

/* GET all customers */
router.get('/all', authFunctions.isAuthenticated, (req, res, next) => {
    Customer.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/* PATCH (update) customer */
router.patch('/', authFunctions.isAuthenticated, (req, res, next) => {
    if (authFunctions.isObjectStrict(req.body.filter, req.body.update)) {
        Customer.updateMany(req.body.filter, {$set: req.body.update}).exec().then(result => {
            if (result.modifiedCount === 0) {
                res.status(200).json({'info': `Updated 0 users.`})
            } else {
                res.status(200).json({'success': `Updated ${result.modifiedCount} user(s).`})
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        })
    } else {
        res.sendStatus(400);
    }
})

/* POST new customer */
router.post('/signup', async (req, res, next) => {
    try {
        const hashedPw = await bcrypt.hash(req.body.password, 10);

        if (await Customer.findOne({username: req.body.email}).exec()) {
            return res.status(409).json({'error': 'Email already exists'});
        }
        if (await Customer.findOne({phone: req.body.phone}).exec()) {
            return res.status(409).json({'error': 'Phone number already exists'});
        }

        const newCustomer = await Customer.create({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            username: req.body.email,
            address: req.body.address,
            birthday: req.body.birthday,
            password: hashedPw,
            verifyToken: crypto.randomBytes(24).toString('hex')
        })

        const htmlEmail = await ejs.renderFile(
            path.join(__dirname, '..', 'views', 'emails', 'verify.ejs'), {
            url: process.env.DOMAIN + "/api/customers/verify/" + newCustomer.verifyToken});

        const verify = await transporter.sendMail({
            from: '"Verify Email" <jidaniel1234@gmail.com>',
            to: newCustomer.email,
            subject: 'Verify Email',
            html: htmlEmail
        })

        console.log(verify);

        res.status(201).json({'success': 'User created.'});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/* DELETE customers */
// router.delete('/delete', authFunctions.isAuthenticated, (req, res, next) => {
router.delete('/delete', (req, res, next) => {
    if (authFunctions.isObjectStrict(req.body.filter)) {
        Customer.deleteMany(req.body.filter).exec().then(result => {
            if (result.deletedCount === 0) {
                res.status(202).json({'info': 'No users deleted.'})
            } else {
                res.status(200).json({'success': `Deleted ${result.deletedCount} user(s).`});
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        res.sendStatus(400);
    }
});

/* POST login request */
router.post('/login', passport.authenticate('local', {successMessage: 'Logged in.', failureMessage: 'Failed to log in.'}), (req, res) => {
    if (req.user) {
        res.status(200).json({'success': 'Logged in.'})
    } else {
        res.status(401);
    }
})

/* POST logout request */
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
