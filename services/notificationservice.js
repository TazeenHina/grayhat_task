const nodemailer = require('nodemailer');
const User = require('../models/user'); // Assuming user model is in models/user.js

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Or any email service you prefer
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send an email notification
const sendNotification = async (toEmail, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email
      to: toEmail,  // Receiver's email
      subject: subject,  // Email subject
      text: message,  // Email body message
    };

    await transporter.sendMail(mailOptions);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

// Function to check if the user has opted in for a specific notification
const canSendNotification = (user, notificationType) => {
  // Check if the notification type exists in user preferences
  return user && user.notificationPreferences && user.notificationPreferences.get(notificationType);
};

module.exports = { sendNotification, canSendNotification };
