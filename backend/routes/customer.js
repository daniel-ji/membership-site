/**
 * Customer routes.
 */

const express = require('express');
const router = express.Router();
const path = require('path');

const ejs = require('ejs');
const transporter = require('../config/nodemailer');

const crypto = require('crypto');
const bcrypt = require('bcrypt');

const validator = require('validator');
const dotenv = require('dotenv');
dotenv.config();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const Customer = require('../models/users/Customer');

/**
 * GET request for verifying customer signup.
 * 
 * Authorized Users: Everyone
 */
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
                    res.redirect(process.env.NODE_ENV === 'DEVELOPMENT' ? 'http://localhost:3000/login'
                    : '/login');
                }
            });
        }
    });
})

/**
 * GET customer based on ObjectId. 
 * 
 * Authorized Users: Managers, Executives
 */
router.get('/one/:id', authFunctions.isManager, (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {        
        Customer.findOne({_id: req.params.id}).exec().then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.sendStatus(500);
        })
    } else {
        res.sendStatus(400);
    }
}) 

/**
 * GET all customers.
 * 
 * Authorized Users: Managers, Executives
 */
router.get('/all', authFunctions.isManager, (req, res, next) => {
    Customer.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/**
 * PATCH customer.
 * 
 * Authorized Users: Self, Managers, Executives
 * 
 * @param {String} _id - ObjectId of customer; required for updating self
 */
router.patch('/', authFunctions.isManagerOrSelf, validFunctions.isReqObjectStrict, (req, res, next) => {
    if (!validFunctions.isValidCustomerUpdate(req.body.update)) {
        return res.sendStatus(400);
    }

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
})

/** 
 * POST new customer.
 * 
 * Authorized Users: Everyone
 */
router.post('/signup', async (req, res, next) => {
    if (!validFunctions.isValidCustomerReg(req.body)) {
        return res.sendStatus(400);
    }

    try {
        const hashedPw = await bcrypt.hash(req.body.password, 10);

        if (await Customer.findOne({username: req.body.email})) {
            return res.status(409).json({'error': 'Email already exists'});
        }
        if (await Customer.findOne({phone: req.body.phone})) {
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
            verifyToken: crypto.randomBytes(8).toString('hex')
        })

        const htmlEmail = await ejs.renderFile(
            path.join(__dirname, '..', 'views', 'emails', 'verify.ejs'), {
            url: process.env.DOMAIN + "/api/customer/verify/" + newCustomer.verifyToken});

        const verify = await transporter.sendMail({
            from: '"Verify Email" <jidaniel1234@gmail.com>',
            to: newCustomer.email,
            subject: 'Verify Email',
            html: htmlEmail
        })

        res.status(201).json({'success': 'Customer created.'});
    } catch (err) {
        res.sendStatus(500);
    }
});

/** 
 * DELETE customers.
 * 
 * Authorized Users: Self, Managers, Executives
 */
router.delete('/delete', authFunctions.isManagerOrSelf, validFunctions.isReqObjectStrict, (req, res, next) => {
    Customer.deleteMany(req.body.filter).exec().then(result => {
        if (result.deletedCount === 0) {
            res.status(202).json({'info': 'No customers deleted.'})
        } else {
            res.status(200).json({'success': `Deleted ${result.deletedCount} customer(s).`});
        }
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = router;
