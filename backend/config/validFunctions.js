/**
 * Backend validation functions to use for routes sending in data. 
 */

const moment = require('moment');
const validator = require('validator');

const customerFields = ['name', 'phone', 'email', 'address', 'birthday', 'password', 'username'];
// TODO: Remove executivePassword when done implementing executive
const managerFields = ['name', 'phone', 'email', 'password', 'executivePassword'];

const commonObjectStrictParams = ['filter', 'update']; 

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
        if (req.body[value] !== undefined && !isObjectStrict(value)) {
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
const isTimestamp = (timestamp, minutesBefore) => {
    return moment(timestamp).isValid() 
        && (minutesBefore === -1 || moment(timestamp).isAfter(moment().subtract(minutesBefore, 'minutes')));
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
        && Object.keys(body).length === customerFields.length
        && isValidCustomerUpdate(body)
}

/**
 * 
 * @returns {Boolean} true if customer update request body is valid, false otherwise 
 */
const isValidCustomerUpdate = (body) => {
    return containsAllowedFields(body, customerFields) 
        && isDate(body.birthday, 18)
        && validator.isEmail(body.email)
        && validator.isMobilePhone(body.phone)
        && validator.isStrongPassword(body.password, {minSymbols: 0})
        && body.name.length > 0 && body.name.length <= 100
        && body.address.length > 0 && body.address.length <= 200;
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
        && validator.isEmail(body.email)
        && validator.isMobilePhone(body.phone)
        && validator.isStrongPassword(body.password)
        && body.name.length > 0 && body.name.length <= 100
}

module.exports = {isObjectStrict, isReqObjectStrict, isDate, isTimestamp, isValidCustomerReg, isValidCustomerUpdate, isValidManagerReg, isValidManagerUpdate};