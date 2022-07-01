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
    },
    phone: {
        type: String,
        required: () => {return this.email != null},
    }, 
    email: {
        type: String, 
        required: () => {return this.phone != null}
    },
    address: {
        type: String,
        required: true
    }, 
    birthday: {
        type: String,
        validate: [val => {
            return moment(val, 'eee mmm dd yyyy').isValid() && moment(val, 'eee mmm dd yyyy').isBefore(moment().subtract(18, 'years'));
        }, 'Invalid birthday'],
        required: true
    }, 
    preferences: [String],
    // Still need to figure out how the data structure is set up 
    transactionHistory: [Schema.Types.ObjectId],
    // Possibly: array of objects, each object has comment (String), reply (String), comment date (String), reply date (String)
    comments: [Schema.Types.ObjectId],
    credits: {
        type: Number,
        default: 0
    }, 
    promotions: [Schema.Types.ObjectId],
    // Possibly: array of objects, eac contains login/logoff/action and time 
    verifyToken: String,
})

module.exports = User.discriminator('Customer', customerSchema);