const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
    expiryDate: {String},
    // promotion is in time, units are days
    promotionLength: {Number},
    // either money or product
    spendingType: {String},
    benefitType: {String},
    requiredSpending: {Number},
    benefit: {Number}
});
