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
    phone: {
        type: String,
        required: () => {return this.email !== null},
        validate: [val => {
            return validator.isMobilePhone(val);
        }, 'Invalid phone number']
    }, 
    email: {
        type: String, 
        required: () => {return this.phone !== null},
        validate: [val => {
            return validator.isEmail(val);
        }, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
    },
    audit: [Schema.Types.ObjectId],
})

module.exports = mongoose.model('User', userSchema);