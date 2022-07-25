/**
 * User Schema.
 * 
 * A user can be a customer, manager, or executive.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validator = require('validator');

const userSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String, 
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    // TODO: test if this.email !== null or !== undefined
    phone: {
        type: String,
        required: () => {return this.email !== undefined},
        validate: [val => {
            return validator.isMobilePhone(val);
        }, 'Invalid phone number']
    }, 
    email: {
        type: String, 
        required: () => {return this.phone !== undefined},
        validate: [val => {
            return validator.isEmail(val);
        }, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    audit: {
        type: [Schema.Types.ObjectId],
        select: false,
    },
    comments: [Schema.Types.ObjectId],
})

module.exports = mongoose.model('User', userSchema);