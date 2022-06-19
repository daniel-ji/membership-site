const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    } catch {
        console.error(err);
    } finally {
        console.log(mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Error connecting to MongoDB')
    }
}

module.exports = connectDB;