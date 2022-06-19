const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const passport = require('passport');

const Customer = require('../models/Customer');

/* GET customers */
router.get('/', (req, res, next) => {
    Customer.findOne({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        res.sendStatus(500);
    })
}) 

/* PATCH (update) customer */
router.patch('/', (req, res, next) => {
    Customer.updateMany(req.body.filter, {$set: req.body.update}).exec().then(result => {
        console.log(req);
        console.log(result);
        res.status(200).json({'success': `Updated ${result.modifiedCount} user(s).`})
    })
})

/* POST new customer */
router.post('/signup', async (req, res, next) => {
    try {
        const hashedPw = await bcrypt.hash(req.body.password, 10);

        if (await Customer.findOne({email: req.body.email}).exec()) {
            return res.status(409).json({'error': 'Email already exists'});
        }

        const newCustomer = await Customer.create({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
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
router.post('/login', async (req, res, next) => {
    try {
        const customer = await Customer.findOne({email: req.body.email}).exec();
        if (customer !== null) {
            if (await bcrypt.compare(req.body.password, customer.password)) {
                res.status(200).json({'success': 'Logged in.'})
            } else {
                res.status(401).json({'error': 'Invalid password.'})
            }
        } else {
            res.status(401).json({'error': 'Invalid email.'})
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;
