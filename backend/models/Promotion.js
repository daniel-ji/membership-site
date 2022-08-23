const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
    creationDate: {
        type: [Date],
        required: true,
        immutable: true
    },
    editDate: Date,
    expiryDate: String,
    // promotion is in time, units are days
    promotionLength: Number,
    // either money or product
    spendingType: String,
    benefitType: String,
    requiredSpending: Number,
    benefit: Number,
    public: {
        type: Boolean,
        default: false
    },
    // customers who have claimed the promotion
    customers: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('Promotion', promotionSchema)