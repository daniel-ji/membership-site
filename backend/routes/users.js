var express = require('express');
var router = express.Router();

const Customer = require('../dbmodels/Customer');

/* GET users listing. */
router.post('/signup', function(req, res, next) {
  console.log(req.body);
  res.send('respond with a resource');
});

module.exports = router;
