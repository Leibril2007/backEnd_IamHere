const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'imhereapp2025@gmail.com',
      pass: 'hbis ejxx lzde hkqj' 
    }
});

module.exports = transporter;