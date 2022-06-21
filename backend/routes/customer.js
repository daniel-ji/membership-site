const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const passport = require('passport');
const mongoose = require('mongoose'); 
const dotenv = require('dotenv');
dotenv.config();

const passportFunctions = require('../config/passportFunctions');

const Customer = require('../models/users/Customer');

/* GET own customer information (if currently logged in as a customer) */
router.get('/self', passportFunctions.isAuthenticated, (req, res, next) => {
    Customer.find({"_id": req.user._id.toString()}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/* GET customer based on Object Id */
router.get('/one/:id', passportFunctions.isAuthenticated, (req, res, next) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {        
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
router.get('/all', passportFunctions.isAuthenticated, (req, res, next) => {
    Customer.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/* PATCH (update) customer */
router.patch('/', passportFunctions.isAuthenticated, (req, res, next) => {
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

/* POST new customer */
router.post('/signup', async (req, res, next) => {
    try {
        const hashedPw = await bcrypt.hash(req.body.password, 10);

        if (await Customer.findOne({username: req.body.email}).exec()) {
            return res.status(409).json({'error': 'Email already exists'});
        }

        const newCustomer = await Customer.create({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            username: req.body.email,
            address: req.body.address,
            birthday: req.body.birthday,
            password: hashedPw
        })

        res.status(201).json({'success': 'User created.'});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

/* DELETE customers */
router.delete('/delete', (req, res, next) => {
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
