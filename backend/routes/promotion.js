/**
 * Promotion routes
 */

const express = require('express');
const router = express.Router();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

const Promotion = require('../models/Promotion');

/**
 * Claim (GET) promotion
 * 
 * TODO: Implement some securities here.
 * 
 * @param {String} _id - id of promotion object
 * 
 * Authorized Users: Customers
 */
router.get('/', (req, res, next) => {
    return res.sendStatus(200);
})

/**
 * Give (POST) promotion
 * 
 * @param {String} promotion_id - id of promotion object
 * @param {String} customer_id - id of customer object to give promotion
 * 
 * Authorized Users: Managers, Executives
 */

/**
 * Use (POST) promotion
 * 
 * @param {String} promotion_id - id of promotion object
 * 
 * Authorized Users: Customers
 */

/**
 * POST promotion
 * 
 * @param {String} name - name of promotion
 * @param {String} expiryDate - the date the promotion is no longer redeemable
 * @param {String} promotionLength - how long the promotion lasts once redeemed (days)
 * @param {String} spendingType - either spending 'money' or purchasing 'product'
 * @param {Number} requiredSpending - amount required to spend
 * @param {String} benefitType - either spending 'credit' or purchasing 'product'
 * @param {Number} benefit - amount of benefit 
 * @param {Boolean} public - whether or not public promotion
 * 
 * Authorized Users: Executives
 */
router.post('/create', authFunctions.isExecutive, validFunctions.isValidPromotion, async (req, res, next) => {
    try {
        const promotion = await Promotion.create({
            creationDate: new Date(),
            expiryDate: req.body.expiryDate,
            promotionLength: req.body.promotionLength,
            spendingType: req.body.spendingType,
            benefitType: req.body.benefitType,
            requiredSpending: req.body.requiredSpending,
            benefit: req.body.benefit,
            public: req.body.public
        })

        return res.sendStatus(200);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

/**
 * POST filter to retrieve promotion(s)
 * 
 * @param {Object} filter - filter of query
 * 
 * Authorized Users: All
 */
router.post('/filter', validFunctions.isReqObjectStrict, (req, res, next) => {
    if (req.body.filter === undefined) {
        return res.sendStatus(400); 
    }
    if (!authFunctions.isManagerHelper(req, res, next)) {
        req.body.filter.public = true;
    }
    Promotion.find(req.body.filter).exec().then(result => {
        return res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        return res.sendStatus(500);
    })
})

/**
 * PATCH promotion
 * 
 * @param {Object} filter - filter of query
 * @param {Object} update - object of fields and corresponding values to update
 * 
 * Authorized Users: Executives
 */

/**
 * DELETE promotion
 * 
 * @param {Object} filter - filter of promtion to delete (usually just an id)
 * 
 * Authorized Users: Executives
 */

module.exports = router;