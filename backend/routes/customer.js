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
 * @param {String} _id - ObjectId of customer; required for updating self
 */
router.patch('/', authFunctions.isManagerOrSelf, validFunctions.isReqObjectStrict, (req, res, next) => {
    if (!validFunctions.isValidCustomerUpdate(req.body.update)) {
        return res.sendStatus(400);
    }

    Customer.updateMany(req.body.filter, {$set: req.body.update}).exec().then(result => {
        responseFunctions.mongoUpdated(req, res, next, result, 'user(s)');
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

        // TODO: actually implement the store location

        const coordsData = await axios.get(`https://dev.virtualearth.net/REST/v1/Locations/` + 
        encodeURIComponent(req.body.address) + 
        `?&key=${process.env.BING_MAPS_API_KEY}`)
        let coordinates;
        
        if (coordsData?.data.resourceSets[0].estimatedTotal > 0 && coordsData.data.resourceSets[0].resources[0].confidence === "High") {
            coordinates = coordsData?.data.resourceSets[0].resources[0].point.coordinates;
        } else {
            return res.status(400).json({'error': 'Bad address.'});
        }
        
        // Get all the stores and the chain and loop through all of them, finding the distance to each store and saving in an array
        // Sort the array and grab top 3 closest locations 
        // For each of the 3, find the actual distance with a Bing Map API request
        // Save (in order) of the distance to stores, and those stores

        const bingData = await axios.get(`https://dev.virtualearth.net/REST/v1/Routes?` + 
            `wp.1=${encodeURIComponent(req.body.address)}` + 
            `&wp.2=${encodeURIComponent('400 Pierre Rd, Walnut, CA 91789')}` + 
            `&optimize=distance&ra=routeSummariesOnly&distanceUnit=mi` + 
            `&key=${process.env.BING_MAPS_API_KEY}`)
        
        // TODO: Refactor this to make address and closest store a map
        const newCustomer = await Customer.create({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            username: req.body.email,
            distanceFromStore: bingData?.data.resourceSets[0].resources[0].travelDistance,
            birthday: req.body.birthday,
            password: hashedPw,
            verifyToken: crypto.randomBytes(8).toString('hex')
        })
        
        // add address to new customer
        newCustomer.address.set(req.body.address, coordinates);

        // add closest stores to new customer
        const chain = await Chain.findOne({_id: req.body.chain})
        // calculate distance from address to each store
        chain.stores.forEach((value, key) => {
            chain.stores.set(key, [...value, Math.sqrt((coordinates[0] - value[0]) ** 2 + (coordinates[1] - value[1]) ** 2)])
        })
        // sort stores by distance to address
        const sortedStores = new Map([...chain.stores.entries()].sort((a, b) => a[1][2] - b[1][2]));
        // get closest three stores absolute distance wise, and sort them by traveling distance 
        const threeStores = new Map();
        let i = 0;
        for (const [key, value] of sortedStores) {
            if (i === 3) return;
            threeStores.set(key, [...value, 0/* TODO: get traveling distance here */])
        }

        const closestStores = new Map([...threeStores.entries()].sort((a, b) => a[1][3] - b[1][3]));
        for (const [key, value] of closestStores) {
            newCustomer.closestStores.set(key, value)
        }

        // save everything
        newCustomer.save();

        const htmlEmail = await ejs.renderFile(
            path.join(__dirname, '..', 'views', 'emails', 'verify.ejs'), {
            url: process.env.DOMAIN + "/api/customer/verify/" + newCustomer.verifyToken});

        // TODO: change email from
        const verify = await transporter.sendMail({
            from: '"Verify Email" <jidaniel1234@gmail.com>',
            to: newCustomer.email,
            subject: 'Verify Email',
            html: htmlEmail
        })

        res.status(201).json({'success': 'Customer created.'});
    } catch (err) {
        console.log(err)
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
