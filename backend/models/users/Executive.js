/**
 * Executive Schema (above Manager). 
 * 
 * Can also be referred to as an owner. 
 * For the most part, an executive user has all the same privileges as a manager.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User')

const executiveSchema = new Schema({
    type: {
        type: String,
        default: 'Executive',
        immutable: true,
    },
    chain: {
        type: Schema.Types.ObjectId,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
    }
})

module.exports = User.discriminator('Executive', executiveSchema);