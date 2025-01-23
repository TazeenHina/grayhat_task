// routes/learners.js
const express = require('express');
const { User } = require('../models/user');  // Assuming your User model contains learners
const Workshop = require('../models/workshop'); // Assuming you have a Workshop model
const auth = require('../middleware/auth'); // To authenticate the user
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

  res.send({ message: 'Successfully enrolled in the workshop!', user });
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
