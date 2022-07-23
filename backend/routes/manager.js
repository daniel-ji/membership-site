const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const Manager = require('../models/users/Manager');

/**
 * GET all managers.
 * 
 * Authorized Users: Executives
 */
router.get('/all', authFunctions.isExecutive, (req, res, next) => {
    Manager.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/**
 * POST new manager.
 * 
 * Authorized Users: Executives
 */
router.post('/create', authFunctions.isExecutive, async (req, res) => {
    if (!validFunctions.isValidManagerReg(req.body)) {
        return res.sendStatus(400);
    }

    try {
        const hashedPw = await bcrypt.hash(req.body.password, 10);

        const newManager = await Manager.create({
            name: req.body.name,
            phone: req.body.phone,
            username: req.body.email,
            email: req.body.email,
            password: hashedPw,
        })

        if (await Manager.findOne({username: req.body.email}).exec()) {
            return res.status(409).json({'error': 'Email already exists'});
        }
        if (await Manager.findOne({phone: req.body.phone}).exec()) {
            return res.status(409).json({'error': 'Phone number already exists'});
        }

        res.status(201).json({'success': 'Manager created.'});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

/**
 * PATCH update manager.
 * 
 * Authorized Users: Self, Executives
 * 
 * @param {String} _id - ObjectId of manager; required for updating self
 */
router.patch('/', authFunctions.isExecutiveOrSelf, validFunctions.isReqObjectStrict, (req, res, next) => {
    if (!validFunctions.isValidManagerUpdate(req.body)) {
        return res.sendStatus(400);
    }

    Manager.updateMany(req.body.filter, {$set: req.body.update}).exec().then(result => {
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
 * DELETE managers.
 * 
 * Authorized Users: Executives
 */
router.delete('/delete', authFunctions.isExecutive, validFunctions.isReqObjectStrict, (req, res, next) => {
    Manager.deleteMany(req.body.filter).exec().then(result => {
        if (result.deletedCount === 0) {
            res.status(202).json({'info': 'No managers deleted.'})
        } else {
            res.status(200).json({'success': `Deleted ${result.deletedCount} manager(s).`});
        }
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
});

module.exports = router;