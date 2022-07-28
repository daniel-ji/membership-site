/**
 * Comment routes.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const validator = require('validator');

const dotenv = require('dotenv');
dotenv.config();

const authFunctions = require('../config/authFunctions');
const validFunctions = require('../config/validFunctions');
 
const Customer = require('../models/users/Customer');
const Manager = require('../models/users/Manager');
const Comment = require('../models/Comment');

/**
 * GET all customers' comments. 
 * 
 * Authorized Users: Managers, Executives
 */
// TODO: Add back authFunctions.isManager
 router.get('/all-comments', (req, res, next) => {
    Comment.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
})

// TODO
/**
 * GET comments specified in filter (a list of ObjectIDs).
 * 
 * Authorized Users: Self, Managers, Executives 
 */

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

const addCommentHelper = async (req, res, next) => {
    // TODO: editing a reply & retaining the repliedComment and making it logically working
    // frontend had to pass in repliedComment again

    // TODO: does originalCommentor even work? 
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
    
            const user = await authFunctions.getUserType(req.user.type).findOneAndUpdate({_id: req.user._id}, {$push: {comments: comment._id}});
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
        if (result.modifiedCount === 0) {
            res.status(202).json({'info': 'No comments deleted.'})
        } else {
            res.status(200).json({'success': `Deleted ${result.modifiedCount} comment(s).`});
        }
    }).catch(err => {
        console.log(err)
        res.sendStatus(500);
    })
})

/**
 * DELETE comment permanently. See regular DELETE. 
 * 
 * Authorized Users: No one? (For dev purposes only)
 */
router.delete('/permanent', authFunctions.isManager, validFunctions.isReqObjectStrict, (req, res, next) => {
    Comment.deleteMany(req.body.filter).exec().then(result => {
        if (result.deletedCount === 0) {
            res.status(202).json({'info': 'No comments permanently deleted.'})
        } else {
            res.status(200).json({'success': `Deleted ${result.deletedCount} comment(s) permanently.`});
        }
    }).catch(err => {
        console.log(err)
        res.sendStatus(500);
    })
})

module.exports = router;