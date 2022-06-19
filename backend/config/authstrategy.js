const Customer = require('../models/Customer');

const verify = async (email, password, done) => {
    try {
        const customer = await Customer.findOne({email: email}).exec();
        if (customer !== null) {
            if (await bcrypt.compare(password, customer.password)) {
                return(null, customer);
            } else {
                return done(null, false, {'message': 'Invalid password.'});
            }
        } else {
            return done(null, false, {'message': 'Invalid email.'});
        }
    } catch (err) {
        console.log(err);
        done(err);
    }
}

module.exports = verify;