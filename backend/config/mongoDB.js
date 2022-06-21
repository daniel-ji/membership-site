const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect(process.env.DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
    }, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Error connecting to MongoDB')
        }
    })
}

module.exports = connectDB;