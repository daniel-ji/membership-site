/**
 * Customer routes.
 */

const express = require('express');
const router = express.Router();
const path = require('path');

const ejs = require('ejs');
const transporter = require('../config/nodemailer');

const axios = require('axios');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const validator = require('validator');
const dotenv = require('dotenv');
dotenv.config();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');
const responseFunctions = require('../config/responseFunctions');
const bingMaps = require('../config/bingMaps');

const Customer = require('../models/users/Customer');
const Chain = require('../models/Chain');

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
 * @param {Object} filter
 * @param {Object} update - fields to update
 * @param {String} filter._id - ObjectId of customer; required for updating self
 */
// TODO: test all this 
router.patch('/', authFunctions.isManagerOrSelf, validFunctions.isReqObjectStrict, async (req, res, next) => {
    if (!validFunctions.isValidCustomerUpdate(req.body.update) && (await Customer.find(req.body.filter).limit(1))[0] !== undefined) {
        return res.sendStatus(400);
    }

    try {
        if (req.body.update.address) {
            const customer = await Customer.findOne(req.body.filter);

            let coordinates = bingMaps.coordinatesOfAddress(req.body.address);
            if (coordinates) {
                customer.address.set(req.body.address, coordinates);
            } else {
                return res.status(400).json({'error': 'Bad address.'});
            }
    
            bingMaps.updateClosestStores(customer, req.body.update.address, coordinates, req.body.update.chain);
        }
        delete req.body.update.address;
        delete req.body.update.chain;

        const updatedCustomer = await Customer.updateOne(req.body.filter, req.body.update);
        responseFunctions.mongoUpdated(req, res, next, result, 'user(s)');
    } catch (err) {
        return res.sendStatus(500);
    }
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
            birthday: req.body.birthday,
            password: hashedPw,
            verifyToken: crypto.randomBytes(8).toString('hex')
        })
        
        let coordinates = await bingMaps.coordinatesOfAddress(req.body.address);
        if (coordinates) {
            newCustomer.address.set(req.body.address, coordinates);
        } else {
            const deleted = await Customer.deleteOne({email: req.body.email})
            return res.status(400).json({'error': 'Bad address.'});
        }

        bingMaps.updateClosestStores(newCustomer, req.body.address, coordinates, req.body.chain);

        const htmlEmail = await ejs.renderFile(
            path.join(__dirname, '..', 'views', 'emails', 'verify.ejs'), {
            url: process.env.DOMAIN + "/api/customer/verify/" + newCustomer.verifyToken});

        // TODO: change email from jidaniel1234@gmail.com
        const verify = await transporter.sendMail({
            from: '"Verify Email" <jidaniel1234@gmail.com>',
            to: newCustomer.email,
            subject: 'Verify Email',
            html: htmlEmail
        })

        res.status(201).json({'success': 'Customer created.'});
    } catch (err) {
        console.log(err);
        Customer.deleteOne({email: req.body.email}).exec().catch(err => {
            console.log(err)
        });
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
        responseFunctions.mongoDeleted(req, res, next, result, 'customer(s)');
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = router;
