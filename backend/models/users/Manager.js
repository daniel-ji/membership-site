const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./User');

const managerSchema = new Schema({
    type: {
        type: String,
        default: 'Manager',
        immutable: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    addedAccounts: [Schema.Types.ObjectId],
    repliedComments: [Schema.Types.ObjectId]
})

module.exports = User.discriminator('Manager', managerSchema);