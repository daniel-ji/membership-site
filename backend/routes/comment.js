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
 * @param {String} _id - ObjectId of customer posting comment
 * @param {String} comment - comment to be posted
 * @param {String} timestamp - timestamp of comment
 * 
 * Authorized Users: Customers
 */

 router.post('/customer', authFunctions.isCustomer, async (req, res, next) => {
    if (!validator.isMongoId(req.body._id) || !validFunctions.isTimestamp(req.body.timestamp, 1)) {
        res.sendStatus(400);
    }

    try {
        const newComment = await Comment.create({
            commentor: req.body._id,
            comment: req.body.comment,
            commentTimestamp: new Date(req.body.timestamp)
        });

        const customer = await Customer.findOneAndUpdate({_id: req.body._id}, {$push: {comments: newComment._id}});

        res.status(201).json({'success': `Comment posted.`});
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

/**
 * POST a reply to the comment.
 * 
 * Authorized Users: Managers, Executives
 */

/**
 * PATCH (edit) comment.
 * 
 * Authorized Users: Self
 */

/**
 * DELETE comment.
 * 
 * Authorized Users: Customers, Managers, Executives
 */

module.exports = router;