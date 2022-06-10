const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true,
    }, 
    commentTimestamp: {
        type: String,
        required: true,
    },
    reply: String,
    replyTimestamp: String
})

module.exports = mongoose.model('Comment', commentSchema);