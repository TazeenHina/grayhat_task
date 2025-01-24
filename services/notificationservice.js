const nodemailer = require('nodemailer');
const {User} = require('../models/user'); // Assuming the User model is in models/user.js

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Or any email service you prefer (e.g., 'outlook', 'yahoo')
  auth: {
    user: process.env.EMAIL_USER, // Your email user from environment variables
    pass: process.env.EMAIL_PASSWORD, // Your email password or App Password (Gmail App Password)
  },
});

// Function to send an email notification
const sendNotification = async (userId, subject, message) => {
  try {
    // Fetch the user's email from the database using the userId
    const user = await User.findById(userId); // Fetch user by their ID
    if (!user) {
      console.error('User not found');
      return;
    }

    // Get the user's email from the fetched user object
    const toEmail = user.email;

    const mailOptions = {
      from: process.env.EMAIL_USER,  // Sender's email (use environment variable)
      to: toEmail,  // Receiver's email
      subject: subject,  // Email subject
      text: message,  // Email body message
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
};

// Function to check if the user has opted in for a specific notification
const canSendNotification = (user, notificationType) => {
  // Check if the notification type exists in user preferences
  if (user && user.notificationPreferences) {
    // Access notificationPreferences with .get() for Map
    return user.notificationPreferences.get(notificationType) || false; 
  }
  return false;
};

module.exports = { sendNotification, canSendNotification };
