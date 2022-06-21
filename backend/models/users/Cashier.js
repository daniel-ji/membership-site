const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User');

const cashierSchema = new Schema({
    type: {
        type: String,
        default: 'Cashier',
        immutable: true
    }
})

module.exports = User.discriminator('Cashier', cashierSchema);