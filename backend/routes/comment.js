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
 router.get('/all-comments', authFunctions.isManager, (req, res, next) => {
    Comment.find({}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
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
 * @param {String} previous_id - ObjectId of comment that is being edited
 * 
 * Authorized Users: Self
 */
router.patch('/', authFunctions.isSelf, validFunctions.isValidComment, (req, res, next) => {
    addCommentHelper(req, res, next);
})

const addCommentHelper = (req, res, next) => {
    // TODO: editing a reply & retaining the repliedComment and making it logically working
    // frontend had to pass in repliedComment again
    try {
        const comment = await Comment.create({
            commentor: req.user._id,
            comment: req.body.comment,
            commentTimestamp: new Date(req.body.timestamp),
            repliedComment: req.body.replied_id ?? null,
            previousComment: req.body.previous_id ?? null
        });

        if (!req.body.replied_id) {
            const repliedComment = await Comment.findOneAndUpdate({_id: req.body.replied_id}, {$set: {replyComment: comment._id}})
        }

        // TODO: implement previous_id
        if (!req.body.previous_id) {
            const previousComment = await Comment.findOneAndUpdate({_id: req.body.previous_id}, {$set: {newComment: comment._id}})
        }

        const customer = await Customer.findOneAndUpdate({_id: req.user._id}, {$push: {comments: comment._id}});

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
 * Authorized Users: Managers, Executives
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