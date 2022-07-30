/**
 * Chain of store routes.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const validator = require('validator');

const Chain = require('../models/Chain')

/**
 * GET all chains.
 */
router.get('/', authFunctions.isDev, (req, res, next) => {
    Chain.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/**
 * GET a chain.
 * 
 * @param {String} _id - ObjectID of Chain object.
 */
router.get('/:_id', authFunctions.isExecutive, (req, res, next) => {
    if (!validator.isMongoId(req.params._id)) {
        return res.sendStatus(400);
    }

    Chain.findOne({_id: req.params._id}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/**
 * POST a new store chain.
 * 
 * @param {String} name - address of new store chain
 */
router.post('/', authFunctions.isExecutive, async (req, res, next) => {
    try {
        if (req.body.name.length > 0 && req.body.name.length < 100 && (await Chain.find({name: req.body.name}).limit(1))[0] === undefined) {
            const newChain = await Chain.create({name: req.body.name})
            res.sendStatus(200);
        } else {
            return res.sendStatus(400);
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

/**
 * PATCH new stores to a chain.
 * TODO: Does not allow duplicate addresses.
 * 
 * @param {String} filter - ObjectID / name of Chain
 * @param {[String]} address - of new store
 */

/**
 * PATCH edit chain name.
 * TODO: Does not allow repeat chain names.
 * 
 * @param {String} name - chain name
 */

/**
 * DELETE a store from a chain.
 */

/**
 * DELETE a chain.
 * 
 * @param {String} _id - Object ID of Chain
 */
router.delete('/', authFunctions.isExecutive, (req, res, next) => {
    if (!validator.isMongoId(req.body._id)) {
        return res.sendStatus(400);
    }

    Chain.deleteOne({_id: req.body._id}).exec().then(result => {
        if (result.deletedCount === 0) {
            res.status(202).json({'info': 'No chain deleted.'})
        } else {
            res.status(200).json({'success': `Deleted one chain.`});
        }
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

module.exports = router;