const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
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
    active: {
        type: Boolean,
        default: false,
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
    audit: [Schema.Types.ObjectId],
    password: {
        type: String,
        required: true
    },
    refreshToken: String
})

module.exports = mongoose.model('Customer', customerSchema);