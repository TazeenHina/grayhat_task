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

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: API for workshop enrollments
 */

/**
 * @swagger
 * /api/enroll:
 *   post:
 *     summary: Enroll a learner in a workshop
 *     tags:
 *       - Enrollments
 *     description: Allows a user to enroll in a workshop and notifies the mentor of the enrollment.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user (learner) who wants to enroll.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workshopId:
 *                 type: string
 *                 description: The ID of the workshop to enroll in.
 *     responses:
 *       200:
 *         description: Waiting for the confirmation from mentor for enrollment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum:
 *                         - learner
 *                         - mentor
 *                 workshop:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request (e.g., user is already enrolled).
 *       404:
 *         description: Workshop or user not found.
 *       500:
 *         description: Internal server error.
 */

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

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: API for workshop enrollments
 */

/**
 * @swagger
 * /api/confirm-enrollment:
 *   post:
 *     summary: Confirm a learner's enrollment in a workshop
 *     tags:
 *       - Enrollments
 *     description: Allows a mentor to confirm a learner's enrollment in a workshop. Sends an email notification to the learner upon confirmation.
 *     parameters:
 *       - in: query
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workshop in which the learner is enrolled.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               learnerId:
 *                 type: string
 *                 description: The ID of the learner whose enrollment is being confirmed.
 *     responses:
 *       200:
 *         description: Enrollment confirmed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the updated enrollment document.
 *                 learnerId:
 *                   type: string
 *                   description: The ID of the learner.
 *                 workshopId:
 *                   type: string
 *                   description: The ID of the workshop.
 *                 status:
 *                   type: string
 *                   description: The enrollment status.
 *                   example: enrolled
 *       400:
 *         description: Bad request (e.g., enrollment not found).
 *       404:
 *         description: Workshop or learner not found.
 *       500:
 *         description: Internal server error.
 */


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

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: API for workshop enrollments
 */

/**
 * @swagger
 * /api/enrolled:
 *   get:
 *     summary: View all workshops a learner is enrolled in
 *     tags:
 *       - Enrollments
 *     description: Retrieves all workshops that a specific learner is enrolled in, along with the activities for each workshop.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the learner whose enrolled workshops are to be fetched.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of workshops the learner is enrolled in, including their activities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the workshop.
 *                   title:
 *                     type: string
 *                     description: The title of the workshop.
 *                   description:
 *                     type: string
 *                     description: A brief description of the workshop.
 *                   activities:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The ID of the activity.
 *                         name:
 *                           type: string
 *                           description: The name of the activity.
 *                         description:
 *                           type: string
 *                           description: A brief description of the activity.
 *       400:
 *         description: Bad request. The provided user ID is invalid.
 *       404:
 *         description: User not found. The learner with the provided user ID does not exist.
 *       500:
 *         description: Internal server error.
 */

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
