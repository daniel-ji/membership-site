var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const Customer = require('../dbmodels/Customer');

/* GET users listing. */
router.post('/signup', async (req, res, next) => {
  try {
    const hashedPw = await bcrypt.hash(req.body.password, 10);

    if (await Customer.findOne({email: req.body.email}).exec()) {
      return res.status(409).json({'error': 'Email already exists'});
    }

    const newCustomer = await Customer.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      birthday: req.body.birthday,
      password: hashedPw
    })

    res.status(201).json({'success': 'User created'});
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
