/**
 * Comment routes.
 */

const express = require('express');
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

const validator = require('validator');
const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');
 
const Comment = require('../models/Comment');

/**
 * GET all customers' comments. 
 * 
 * Authorized Users: Managers, Executives
 */
 router.get('/all-comments', authFunctions.isManager, (req, res, next) => {
    Comment.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

/**
 * GET comments specified in filter (a list of ObjectIDs).
 * 
 * @param {Array} comments - array of ids of comments to request for 
 * 
 * Authorized Users: Self, Managers, Executives 
 */
router.post('/filters', authFunctions.isManagerOrSelf, (req, res, next) => {
    if (req.body.comments?.constructor === Array && req.body.comments.every(e => validator.isMongoId(e))) {
        console.log(req.body.comments)
        filter = req.body.comments.map(e => {return {_id: e}})
        Comment.find({$or: filter}).exec().then(result => {
            res.status(200).json(result)
        }).catch(err => {
            console.log(err);
            res.sendStatus(500)
        })
    } else {
        res.sendStatus(400);
    }
})

/**
 * POST new comment, by a customer.
 * 
 * @param {String} replied_id - ObjectId of comment be replied to 
 * @param {String} comment - comment to be posted
 * @param {String} timestamp - timestamp of comment
 * 
 * Authorized Users: Customers, Managers, Executives
 */
 router.post('/', authFunctions.isAuthenticated, validFunctions.isValidComment, async (req, res, next) => {
    addCommentHelper(req, res, next);
})

/**
 * PATCH (edit) comment. See POST comment.
 * One addditional parameter:
 * 
 * @param {String} _id - ObjectId of comment that is being edited
 * 
 * Authorized Users: Self
 */
router.patch('/', authFunctions.isAuthenticated, validFunctions.isValidComment, async (req, res, next) => {
    addCommentHelper(req, res, next);
})

/**
 * Helper function for editing and posting comments (since they're somewhat similar)
 */
const addCommentHelper = async (req, res, next) => {
    try { 
        if (req.body._id !== undefined) {
            const comment = await Comment.findOneAndUpdate({_id: req.body._id}, {$push: {comment: req.body.comment, commentTimestamp: req.body.timestamp}})
        } else {
            const comment = await Comment.create({
                commentor: req.user._id,
                comment: [req.body.comment],
                commentTimestamp: [new Date(req.body.timestamp)],
                originalCommentor: req.body.replied_id ? (await Comment.findOne({_id: req.body.replied_id})).originalCommentor : req.user._id,
                repliedComment: req.body.replied_id,
                replyComments: req.body.previous_id ? (await Comment.findOne({_id: req.body.previous_id})).replyComments : [],
            });

            if (req.body.replied_id !== undefined) {
                const repliedComment = await Comment.findOneAndUpdate({_id: req.body.replied_id}, {$push: {replyComments: comment._id}})
            }
    
            const user = await authFunctions.getUserType(req.user.type).updateOne({_id: req.user._id}, {$push: {comments: comment._id}});
        }

        res.status(201).json({'success': `Comment posted.`});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

/**
 * DELETE comment.
 * 
 * @param {Object} filter Delete comments with given filter.
 * 
 * Authorized Users: Self, Managers, Executives
 */
router.delete('/', authFunctions.isManagerOrSelf, validFunctions.isReqObjectStrict, (req, res, next) => {
    Comment.updateMany(req.body.filter, {$set: {deleted: true}}).exec().then(result => {
        responseFunctions.mongoDeleted(req, res, next, result, 'comment(s)');
    }).catch(err => {
        console.log(err)
        res.sendStatus(500);
    })
})

/**
 * DELETE comment permanently. See regular DELETE. 
 * 
 * Authorized Users: Dev
 */
router.delete('/permanent', authFunctions.isDev, validFunctions.isReqObjectStrict, (req, res, next) => {
    Comment.deleteMany(req.body.filter).exec().then(result => {
        responseFunctions.mongoDeleted(req, res, next, result, 'comment(s) permanently')
    }).catch(err => {
        console.log(err)
        res.sendStatus(500);
    })
})

module.exports = router;