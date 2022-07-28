const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const Executive = require('../models/users/Executive');


/**
 * POST new executive.
 * 
 * Authorized Users: 
 */
 router.post('/create', authFunctions.isExecutiveOrDev, async (req, res) => {
    // same fields as manager
    if (!validFunctions.isValidManagerReg(req.body)) {
        return res.sendStatus(400);
    }

    try {
        const hashedPw = await bcrypt.hash(req.body.password, 10);

        if (await Executive.findOne({username: req.body.email})) {
            return res.status(409).json({'error': 'Email already exists'});
        }
        if (await Executive.findOne({phone: req.body.phone})) {
            return res.status(409).json({'error': 'Phone number already exists'});
        }

        const newExecutive = await Executive.create({
            name: req.body.name,
            phone: req.body.phone,
            username: req.body.email,
            email: req.body.email,
            password: hashedPw,
        })

        res.status(201).json({'success': 'Executive created.'});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;