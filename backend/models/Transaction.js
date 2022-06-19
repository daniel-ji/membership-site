const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    price: {
        type: Number,
        required: true
    }, 
    date: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Transaction', transcationSchema);