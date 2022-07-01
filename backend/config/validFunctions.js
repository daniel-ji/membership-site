const moment = require('moment');

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
    return moment(date, 'eee mmm dd yyyy').isValid() && 
        (yearsBefore === -1 || moment(date, 'eee mmm dd yyyy').isBefore(moment().subtract(yearsBefore, 'years')))
}

const isValidCustomer = (body) => {
    return isDate(body.birthday, 18);
}

module.exports = {isObjectStrict, isDate, isValidCustomer};