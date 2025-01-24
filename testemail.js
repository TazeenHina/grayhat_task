const nodemailer = require('nodemailer');
require('dotenv').config();  // Make sure dotenv is required at the top to load environment variables
const config = require('config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'tazeenhina24@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from Nodemailer.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Email sent:', info.response);
});
