/**
 * Backend validation functions to use for routes sending in data. 
 */

const moment = require('moment');
const validator = require('validator');

// TODO: replace comments back with preferences
const customerFields = ['name', 'phone', 'email', 'address', 'birthday', 'password', 'username', 'chain', 'comments'];
const managerFields = ['name', 'phone', 'email', 'password'];
const commentFields = ['replied_id', 'comment', 'timestamp', '_id'];
const promotionFields = ['name', 'expiryDate', 'promotionLength', 'spendingType', 'requiredSpending', 'benefitType', 'benefit'];
const commonObjectStrictParams = ['filter', 'update']; 

const Comment = require('../models/Comment');
const Chain = require('../models/Chain');
const authFunctions = require('./authFunctions');

/**
 * Ensuring MongoDB filters and new data are valid objects.
 * 
 * @param {Array} values Array of values to check if each of them are valid objects.
 * 
 * @returns {Boolean} true if all objects are valid, otherwise false 
 */
const isObjectStrict = (...values) => {
    for (const value of values) {
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
            return false;
        }
    }
    return true;
}

/** 
 * Middleware version of isObjectStrict, but for common req params 
 */
const isReqObjectStrict = (req, res, next) => {
    for (const value of commonObjectStrictParams) {
        if (req.body[value] !== undefined && !isObjectStrict(req.body[value])) {
            return res.sendStatus(400); 
        }
    }
    return next();
} 

/**
 * 
 * @param {String} date Date in toDateString() format  
 * @param {*} yearsBefore ensure date is at least yearsBefore years before today
 * @returns {Boolean} true if date is valid, false otherwise
 */
const isDate = (date, yearsBefore = -1, afterToday = false) => {
    return moment(date, 'E MMM dd yyyy').isValid() 
        && (yearsBefore === -1 || moment(date, 'E MMM dd yyyy').isBefore(moment().subtract(yearsBefore, 'years'))
        && (!afterToday || moment(date, 'E MMM dd yyyy').isAfter(moment())))
}

/**
 * 
 * @param {String} date Timestamp (Date) in toISOString() format
 * @returns {Boolean} true if timestamp is valid, false otherwise
 */
const isTimestamp = (timestamp, minutesTolerance = -1) => {
    return moment(timestamp).isValid() 
        && (minutesTolerance === -1 
            || (moment(timestamp).isAfter(moment().subtract(minutesTolerance, 'minutes')) 
                && moment(timestamp).isBefore(moment().add(minutesTolerance, 'minutes'))));
}

/**
 * 
 * @param {Object} body request body 
 * @param {*} whitelist whitelist of allowed fields
 * @returns {Boolean} true if all body keys are all allowed fields, false otherwise
 */
const containsAllowedFields = (body, whitelist) => {
    let result = true;
    Object.keys(body).forEach(key => {
        if (!whitelist.includes(key)) {
            result = false;
            return;
        }
    });
    return result;
}

/**
 * Customer registration request body must contain exact number of key/value pairs. 
 * 
 * @returns {Boolean} true if customer registration request body is valid, false otherwise
 */
const isValidCustomerReg = (req, res, next) => {
    if (req.body.username === req.body.email 
        && Object.keys(req.body).length === customerFields.length - 1
        && req.body.preferences === undefined
        && isValidCustomerUpdate(req.body)) {
        return next()
    } else {
        return res.sendStatus(400)
    }
}

/**
 * 
 * @returns {Boolean} true if customer update request body is valid, false otherwise 
 */
const isValidCustomerUpdate = async (body) => {
    try {
        return containsAllowedFields(body, customerFields) 
        && (!body.birthday || isDate(body.birthday, 18))
        && (!body.email || validator.isEmail(body.email))
        && (!body.phone || validator.isMobilePhone(body.phone))
        && (!body.password || validator.isStrongPassword(body.password, {minSymbols: 0}))
        && (!body.name || body.name.length > 0 && body.name.length <= 100)
        && (!body.address || body.address.length > 0 && body.address.length <= 200)
        && (!body.chain || (validator.isMongoId(body.chain) && !!(await Chain.find({name: body.chain}).limit(1))[0]));
    } catch (err) {
        console.log(err);
        return false;
    }
}

/**
 * Similar to isValidCustomer, but with manager fields.
 */
const isValidManagerReg = (body) => {
    return Object.keys(body).length === managerFields.length
        && isValidManagerUpdate(body)
}

/**
 * Similar to isValidCustomerUpdate, but with manager fields.
 */
const isValidManagerUpdate = (body) => {
    return containsAllowedFields(body, managerFields)
        && (!body.email || validator.isEmail(body.email))
        && (!body.phone || validator.isMobilePhone(body.phone))
        && (!body.password || validator.isStrongPassword(body.password))
        && (!body.name || body.name.length > 0 && body.name.length <= 100)
}

/**
 * 
 * @returns Bad Request if data is not proper comment POST request.
 */
const isValidComment = async (req, res, next) => {
    if (!containsAllowedFields(req.body, commentFields)) {
        return res.sendStatus(400);
    }

    try {
        let valid = true;

        if (isTimestamp(req.body.timestamp, 2)) {
            if (req.body.replied_id === undefined) {
                // do nothing
            } else if (req.body._id !== undefined) { 
                // cant be passing in both, doesn't make sense
                valid = false;
            } else {
                if (validator.isMongoId(req.body.replied_id)) {
                    const repliedComment = (await Comment.find({_id: req.body.replied_id}).limit(1))[0];
                    if (repliedComment === undefined || repliedComment.deleted 
                        || (!authFunctions.isManagerHelper(req, res, next) 
                            && !(await Comment.findOne({_id: req.body.replied_id})).originalCommentor.equals(req.user._id))) {
                        valid = false;
                    }
                } else {
                    valid = false;
                }   
            }

            // valid if comment exists, commentors are the same, which is equal to current user 
            if (req.body._id === undefined || !valid) {
                // do nothing
            } else {
                if (validator.isMongoId(req.body._id)) {
                    const comment = (await Comment.find({_id: req.body._id}).limit(1))[0];
                    if (comment !== undefined && !comment.deleted 
                        && comment.commentor.equals(req.user._id)) {
                        // do nothing
                    } else {
                        if (!comment.commentor.equals(req.user._id)) {
                            return res.sendStatus(403);
                        }
                        valid = false;
                    }
                } else {
                    valid = false;
                }
            }
        } else {
            valid = false;
        }

        if (valid) {
            return next();
        } else {
            return res.sendStatus(400);
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }

}

// TODO: test all this
/**
 * @returns Bad Request if data is not proper promotion create POST request.
 */
const isValidPromotion = (req, res, next) => {
    if (Object.keys(req.body).length === promotionFields.length) {
        return isValidPromotionUpdate(req, res, next)
    }
    
    return res.sendStatus(400);
}

/**
 * @returns Bad Request if data is not proper promotion update POST request.
 */
const isValidPromotionUpdate = (req, res, next) => {
    if (!containsAllowedFields(req.body, promotionFields)) {
        return res.sendStatus(400);
    }

    // TODO: especially test all of this
    nameValid = req.body.name === undefined || (typeof req.body.name === 'string' && req.body.name.length > 0 && req.body.name.length < 500)
    expiryDateValid = req.body.expiryDate === undefined || isDate(req.body.expiryDate, -1, true)
    promotionLengthValid = req.body.promotionLength === undefined || (Number.isInteger(req.body.promotionLength) && req.body.promotionLength > 0 && req.body.promotionLength < 365 * 100)
    spendingTypeValid = req.body.spendingType === undefined || (typeof req.body.spendingType === 'string' && (req.body.spendingType.toLowerCase() === 'money' || req.body.spendingType.toLowerCase() === 'product'))
    requiredSpendingValid = req.body.requiredSpending === undefined || (Number.isInteger(req.body.requiredSpending) && req.body.requiredSpending >= 0 && req.body.requiredSpending < 1000000)
    benefitTypeValid = req.body.benefitType === undefined (typeof req.body.benefitType === 'string' && (req.body.benefitType === 'credit' || req.body.spendingType.toLowerCase() === 'product'))
    benefitValid = req.body.benefit === undefined || (Number.isInteger(req.body.benefit) && req.body.benefit > 0 && req.body.benefit > 1000000)

    if (nameValid && expiryDateValid && promotionLenghtValid && spendingTypeValid && requiredSpendingValid && benefitTypeValid && benefitValid) {
        return next();
    } else {
        return res.sendStatus(400);
    }
    
}

module.exports = {isObjectStrict, isReqObjectStrict, isDate, isTimestamp, isValidCustomerReg, isValidCustomerUpdate, isValidManagerReg, isValidManagerUpdate, isValidComment, isValidPromotion};