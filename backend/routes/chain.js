/**
 * Chain of store routes.
 * 
 * Authorized Users: Executive or Dev
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');
const responseFunctions = require('../config/responseFunctions');

const validator = require('validator');

const Chain = require('../models/Chain')
const Executive = require('../models/users/Executive')

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
 * GET chain.
 */
router.get('/self', authFunctions.isExecutive, (req, res, next) => {
    if (!req.user.chain) {
        return res.status(400).json({"error": "Executive does not have a chain."});
    }

    Chain.findOne({_id: req.user.chain}).exec().then(result => {
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
        if (req.body.name?.length > 0 && req.body.name.length < 100 && (await Chain.find({name: req.body.name}).limit(1))[0] === undefined) {
            const newChain = await Chain.create({name: req.body.name})
            console.log(newChain);
            const executive = await Executive.updateOne({_id: req.user._id}, {chain: newChain._id})
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
 * PATCH a chain to an executive.
 * 
 * @param {String} user_id - ObjectID of executive
 * @param {String} chain_id - ObjectID of chain to add 
 */
router.patch('/executive', authFunctions.isDev, async (req, res, next) => {
    try {
        if (validator.isMongoId(req.body.user_id) && validator.isMongoId(req.body.chain_id)
            && (await Executive.find({_id: req.body.user_id}).limit(1))[0] !== undefined
            && (await Chain.find({_id: req.body.chain_id}).limit(1))[0] !== undefined) {
            const executive = await Executive.updateOne({_id: req.body.user_id}, {chain: req.body.chain_id})
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

/**
 * PATCH new stores to a chain.
 * 
 * @param {String} address - of new store
 */
router.patch('/store', authFunctions.isExecutive, (req, res, next) => {
    if (!req.user.chain) {
        return res.status(400).json({"error": "Executive does not have a chain."});
    }

    if (req.body.address?.length > 0 && req.body.address.length < 100) {
        Chain.updateOne({_id: req.user.chain}, {$addToSet: {stores: req.body.address}}).exec().then(result => {
            console.log(result);
            responseFunctions.mongoUpdated(req, res, next, result, 'chain(s)');
        }).catch(err => {
            console.log(err)
            res.sendStatus(500);
        })
    } else {
        res.sendStatus(400);
    }
})

/**
 * PATCH edit chain name.
 * TODO: Does not allow repeat chain names.
 * 
 * @param {String} name - chain name
 */
router.patch('/name', authFunctions.isExecutive, async (req, res, next) => {
    if (!req.user.chain) {
        return res.status(400).json({"error": "Executive does not have a chain."});
    }

    try {
        if (req.body.name.length > 0 && req.body.name.length < 100) {
            const existingChain = await Chain.findOne({name: req.body.name});

            if (existingChain === null) {
                const chain = await Chain.updateOne({_id: req.user.chain}, {name: req.body.name})
                res.sendStatus(200)
            } else if (existingChain._id.equals(req.user.chain)) {
                res.sendStatus(202)
            } else {
                res.sendStatus(409)
            }
        } else {
            res.sendStatus(400);
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

/**
 * DELETE a store from a chain.
 * 
 * @param {String} address - of the store
 */
router.delete('/store', authFunctions.isExecutive, (req, res, next) => {
    if (!req.user.chain) {
        return res.status(400).json({"error": "Executive does not have a chain."});
    }

    if (req.body.address?.length > 0 && req.body.address.length < 100) {
        Chain.updateOne({_id: req.user.chain}, {$pull: {stores: req.body.address}}).exec().then(result => {
            console.log(result);
            responseFunctions.mongoDeleted(req, res, next, result, 'chain(s)');
        }).catch(err => {
            console.log(err)
            res.sendStatus(500);
        })
    } else {
        res.sendStatus(400);
    }
}) 

/**
 * DELETE a chain.
 * 
 */
router.delete('/', authFunctions.isExecutive, (req, res, next) => {
    Chain.deleteOne({_id: req.user.chain}).exec().then(result => {
        responseFunctions.mongoDeleted(req, res, next, result, 'chain(s)');
    }).catch(err => {
        console.log(err);
        !res.headersSent && res.sendStatus(500);
    })
    Executive.updateOne({_id: req.user._id}, {chain: undefined}).exec().catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/**
 * Disown chain.
 */
router.delete('/disown', authFunctions.isExecutive, (req, res, next) => {
    Executive.updateOne({_id: req.user._id}, {$unset: {chain: 1}}).exec().then(result => {
        console.log(result)
        responseFunctions.mongoDeleted(req, res, next, result, "chain from executive ownership");
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

module.exports = router;