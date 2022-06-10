const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auditSchema = new Schema({
    event: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Audit', auditSchema);