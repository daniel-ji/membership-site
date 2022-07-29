/**
 * Chain as in a chain of stores.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chainSchema = newSchema({
    stores: [String]
}) 

module.exports = mongoose.model('Chain', chainSchema);