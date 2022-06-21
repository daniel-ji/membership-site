const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User')

const ownerSchema = new Schema({
    type: {
        type: String,
        default: 'Owner',
        immutable: true,
    }
})

module.exports = User.discriminator('Owner', ownerSchema);