const moment = require('moment');
const validator = require('validator');

const customerFields = ['name', 'phone', 'email', 'address', 'birthday', 'password', 'username'];
// TODO: Remove ownerPassword when done implementing owner
const managerFields = ['name', 'phone', 'email', 'password', 'ownerPassword'];

const isObjectStrict = (...values) => {
    let result = true;
    values.forEach(value => {
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
            result = false;
        }
    })
    return result;
}

const isDate = (date, yearsBefore = 0) => {
    return moment(date, 'E MMM dd yyyy').isValid() && 
        (yearsBefore === -1 || moment(date, 'E MMM dd yyyy').isBefore(moment().subtract(yearsBefore, 'years')))
}

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

const isValidCustomerReg = (body) => {
    return body.username === body.email 
        && Object.keys(body).length == customerFields.length
        && isValidCustomerUpdate(body)
}

const isValidCustomerUpdate = (body) => {
    return containsAllowedFields(body, customerFields) 
        && isDate(body.birthday, 18)
        && validator.isEmail(body.email)
        && validator.isMobilePhone(body.phone)
        && validator.isStrongPassword(body.password, {minSymbols: 0})
        && body.name.length > 0 && body.name.length <= 100
        && body.address.length > 0 && body.address.length <= 200;
}

const isValidManagerReg = (body) => {
    return Object.keys(body).length == managerFields.length
        && isValidManagerUpdate(body)
}

const isValidManagerUpdate = (body) => {
    return containsAllowedFields(body, managerFields)
        && validator.isEmail(body.email)
        && validator.isMobilePhone(body.phone)
        && validator.isStrongPassword(body.password)
        && body.name.length > 0 && body.name.length <= 100
}

module.exports = {isObjectStrict, isDate, isValidCustomerReg, isValidCustomerUpdate, isValidManagerReg, isValidManagerUpdate};