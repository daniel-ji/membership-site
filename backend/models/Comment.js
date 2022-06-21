const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commentor: {
        type: Schema.Types.ObjectId,
        required: true
    },
    comment: {
        type: String,
        required: true,
    }, 
    commentTimestamp: {
        type: String,
        required: true,
    },
    replier: Schema.Types.ObjectId,
    reply: String,
    replyTimestamp: String
    // possible issue: should be inserting the replier, reply, and timestap field at the same time
})

module.exports = mongoose.model('Comment', commentSchema);