const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    type: {
        type: String,
        required: true
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
    password: {
        type: String,
        required: true,
    },
    audit: [Schema.Types.ObjectId],
})

module.exports = mongoose.model('User', userSchema);