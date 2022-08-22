/**
 * Promotion routes
 */

const express = require('express');
const router = express.Router();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');

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
 * 
 * Authorized Users: Executives
 */
router.post('/create', authFunctions.isExecutive, validFunctions.isValidPromotion, async (req, res, next) => {
    res.sendStatus(200);
})

/**
 * GET promotion(s)
 * 
 * @param {Object} filter - filter of query
 * 
 * Authorized Users: All
 */

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