const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    commentor: {
        type: Schema.Types.ObjectId,
        required: true
    },
    comment: {
        type: [String],
        required: true,
    }, 
    commentTimestamp: {
        type: [Date],
        required: true,
    },
    // TODO: implement in routes 
    originalCommentor: Schema.Types.ObjectId,
    // comment that this comment is a reply to
    repliedComment: Schema.Types.ObjectId,
    // comment that replies to this comment
    replyComments: [Schema.Types.ObjectId],
    // possible issue: should be inserting the replier, reply, and timestap field at the same time
    deleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Comment', commentSchema);