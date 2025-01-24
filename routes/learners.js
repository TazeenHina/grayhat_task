// routes/learners.js
const express = require('express');
const { User } = require('../models/user');  // Assuming your User model contains learners
const Workshop = require('../models/workshop'); // Assuming you have a Workshop model
const auth = require('../middleware/auth'); // To authenticate the user
const { sendNotification, canSendNotification } = require('../services/notificationservice');
const { Enrollment } = require('../models/enrollment');
const _ = require('lodash');
const mongoose = require('mongoose');
const router = express.Router();

// Enroll a learner in a workshop
router.post('/enroll', auth, async (req, res) => {
  const userId = req.query.userId;
  const workshopId = req.body.workshopId;

  // Find the workshop
  const workshop = await Workshop.findById(workshopId);
  if (!workshop) return res.status(404).send('Workshop not found.');

  // Find the learner (user)
  const user = await User.findById(userId);
  if (!user) return res.status(404).send('User not found.');

  // Ensure the user is not already enrolled
  if (user.workshops.includes(workshopId)) {
    return res.status(400).send('User is already enrolled in this workshop.');
  }

  // Enroll the user (learner) in the workshop
  user.workshops.push(workshopId);
  await user.save();

  // Create an enrollment document
  const enrollment = new Enrollment({
    learnerId: userId,
    workshopId: workshopId,
    status: 'pending',  // Initially, the enrollment is pending
  });

  await enrollment.save();

  const mentor = await User.findById(workshop.mentorId);
  if (mentor && canSendNotification(mentor, 'enrollment')) {
    const subject = 'New Learner Enrollment';
    const message = `A learner has enrolled in your workshop: ${workshop.title}.`;
    await sendNotification(mentor._id, subject, message); // Send email to mentor
  }

  res.send({ message: 'You have enrolled in the workshop. Waiting for the mentors confirmation!', 
    user: _.pick(user, ['_id', 'name', 'email','role']),
    workshop: _.pick(workshop,['id','title','activities']
    )
});
});

router.post('/confirm-enrollment', async (req, res) => {
    const { learnerId } = req.body; // Learner's ID from the request body
    const workshopId = req.query.workshopId; // Workshop ID from the query string
  
    try {
      // Find the enrollment document and update the status to 'enrolled'
      const enrollment = await Enrollment.findOneAndUpdate(
        { learnerId, workshopId },
        { status: 'enrolled' },
        { new: true } // Get the updated document
      );
  
      if (!enrollment) {
        return res.status(404).send('Enrollment not found');
      }
  
      // Fetch the learner to send them the confirmation email
      const learner = await User.findById(learnerId);
      if (!learner) {
        return res.status(404).send('Learner not found');
      }
  
      // Notify the learner if they have opted in for the 'enrollment' notification
      if (canSendNotification(learner, 'enrollment')) {
        const subject = 'Your Enrollment Has Been Confirmed!';
        const message = `Dear ${learner.name},\n\nYour enrollment in the workshop "${workshopId}" has been confirmed by the mentor. We look forward to your participation!`;
        await sendNotification(learner._id, subject, message); // Send email to learner
      }
  
      // Respond with the updated enrollment status
      res.status(200).send(enrollment);
    } catch (error) {
      console.error('Error confirming enrollment:', error);
      res.status(500).send('Error confirming enrollment');
    }
  });

// View all workshops a learner is enrolled in
router.get('/enrolled', auth, async (req, res) => {
  const userId = req.query.userId;

  // Find the learner (user) and populate the workshops with their details
  const user = await User.findById(userId).populate({
    path: 'workshops',
    populate: {
      path: 'activities', // Populate the activities for each workshop
      model: 'Activity',
    },
  });

  if (!user) return res.status(404).send('User not found.');

  res.send(user.workshops); // This will send the workshops with their activities
});

module.exports = router;
