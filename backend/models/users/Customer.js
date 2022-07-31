/**
 * Customer Schema.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User');

const moment = require('moment');

const customerSchema = new Schema({
    type: {
        type: String,
        default: 'Customer',
        immutable: true,
    },
    name: {
        type: String,
        required: true,
        validate: [val => {
            return val.length > 0 && val.length <= 100;
        }, 'Invalid name']
    },
    address: {
        type: String,
        required: true,
        validate: [val => {
            return val.length > 0 && val.length <= 200;
        }, 'Invalid address']
    }, 
    addressCoords: {
        type: [Number],
        required: true
    },
    // units: miles
    distanceFromStore: Number,
    birthday: {
        type: Date,
        validate: [val => {
            return moment(val, 'E MMM dd yyyy').isValid() && moment(val, 'E MMM dd yyyy').isBefore(moment().subtract(18, 'years'));
        }, 'Invalid birthday'],
        required: true
    }, 
    preferences: [String],
    // Still need to figure out how the data structure is set up 
    transactionHistory: [Schema.Types.ObjectId],
    credits: {
        type: Number,
        default: 0
    }, 
    promotions: [Schema.Types.ObjectId],
    // Possibly: array of objects, eac contains login/logoff/action and time 
    verifyToken: String,
})

module.exports = User.discriminator('Customer', customerSchema);