const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User')

const executiveSchema = new Schema({
    type: {
        type: String,
        default: 'Executive',
        immutable: true,
    }
})

module.exports = User.discriminator('Executive', executiveSchema);