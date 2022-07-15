const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const Manager = require('../models/users/Manager');

dotenv.config();

/**
 * GET all managers.
 * 
 * Authorized Users: Owners
 */
router.get('/all', authFunctions.isOwner, (req, res, next) => {
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
 * Authorized Users: Owners
 */
router.post('/create', authFunctions.isOwner, async (req, res) => {
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
 * Authorized Users: Self, Owners
 * 
 * @param {String} _id - ObjectId of manager; required for updating self
 */
router.patch('/', authFunctions.isOwnerOrSelf, (req, res, next) => {
    if (!validFunctions.isValidManagerUpdate(req.body)) {
        res.sendStatus(400)
    }

    if (validFunctions.isObjectStrict(req.body.filter, req.body.update)) {
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
    } else {
        res.sendStatus(400);
    }
})

/**
 * DELETE managers.
 * 
 * Authorized Users: Owners
 */
router.delete('/delete', authFunctions.isOwner, (req, res, next) => {
    if (validFunctions.isObjectStrict(req.body.filter)) {
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
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;