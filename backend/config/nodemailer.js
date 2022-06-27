const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587, 
    secure: false,
    auth: {
        user: process.env.SENDINBLUE_USER,
        pass: process.env.SENDINBLUE_PASS
    }
})

module.exports = transporter;