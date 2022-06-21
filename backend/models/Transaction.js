const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    buyer: {
        type: Schema.Types.ObjectId,
        required: true
    },
    recepient: {
        type: Schema.Types.ObjectId,
        required: true
    },
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