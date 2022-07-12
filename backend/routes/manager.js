const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const Manager = require('../models/users/Manager');

dotenv.config();

/* GET all customers */
router.get('/all', authFunctions.isOwner, (req, res, next) => {
    Manager.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/* POST new manager */
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

module.exports = router;