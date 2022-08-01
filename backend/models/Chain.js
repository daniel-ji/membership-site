/**
 * Chain as in a chain of stores.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chainSchema = new Schema({
    name: String,
    // address, coordinates
    stores: {
        type: Map,
        of: [Number],
        default: {}
    }
}) 

module.exports = mongoose.model('Chain', chainSchema);