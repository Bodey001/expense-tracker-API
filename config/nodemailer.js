const nodemailer = require('nodemailer');
require("dotenv").config();

//create a transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, //Not recommended for production
  },
});

module.exports = transporter;