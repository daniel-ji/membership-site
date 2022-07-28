/**
 * Backend validation functions to use for routes sending in data. 
 */

const moment = require('moment');
const validator = require('validator');

// TODO: replace comments back with preferences
const customerFields = ['name', 'phone', 'email', 'address', 'birthday', 'password', 'username', 'comments'];
// TODO: Remove executivePassword when done implementing executive
const managerFields = ['name', 'phone', 'email', 'password', 'executivePassword'];
const commentFields = ['replied_id', 'comment', 'timestamp', '_id'];
const commonObjectStrictParams = ['filter', 'update']; 

const Comment = require('../models/Comment');
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
const isDate = (date, yearsBefore = 0) => {
    return moment(date, 'E MMM dd yyyy').isValid() 
        && (yearsBefore === -1 || moment(date, 'E MMM dd yyyy').isBefore(moment().subtract(yearsBefore, 'years')))
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
const isValidCustomerReg = (body) => {
    return body.username === body.email 
        && Object.keys(body).length === customerFields.length - 1
        && body.preferences === undefined
        && isValidCustomerUpdate(body)
}

/**
 * 
 * @returns {Boolean} true if customer update request body is valid, false otherwise 
 */
const isValidCustomerUpdate = (body) => {
    return containsAllowedFields(body, customerFields) 
        && (!body.birthday || isDate(body.birthday, 18))
        && (!body.email || validator.isEmail(body.email))
        && (!body.phone || validator.isMobilePhone(body.phone))
        && (!body.password || validator.isStrongPassword(body.password, {minSymbols: 0}))
        && (!body.name || body.name.length > 0 && body.name.length <= 100)
        && (!body.address || body.address.length > 0 && body.address.length <= 200);
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
// TODO: redo validation for comment arrays
const isValidComment = async (req, res, next) => {
    if (!containsAllowedFields(req.body, commentFields)) {
        return res.sendStatus(400);
    }

    // TODO: Test replied_id and _id validation
    try {
        let valid = true;

        // TODO: change after
        if (isTimestamp(req.body.timestamp, 15)) {
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

module.exports = {isObjectStrict, isReqObjectStrict, isDate, isTimestamp, isValidCustomerReg, isValidCustomerUpdate, isValidManagerReg, isValidManagerUpdate, isValidComment};