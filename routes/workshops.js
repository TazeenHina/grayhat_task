const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Workshop = require('../models/workshop');
const Activity = require('../models/activity');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/workshops:
 *   get:
 *     summary: Get all workshops
 *     description: Fetch all workshops sorted by title
 *     responses:
 *       200:
 *         description: A list of workshops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   mentorId:
 *                     type: string
 *       500:
 *         description: Error retrieving workshops
 */
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort('title');
    res.send(workshops);
  } catch (err) {
    res.status(500).send('Error retrieving workshops');
  }
});

// Create a new workshop (mentor only)
/**
 * @swagger
 * /api/workshops:
 *   post:
 *     summary: Create a new workshop (mentor only)
 *     description: Create a new workshop by a mentor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created workshop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 mentorId:
 *                   type: string
 *       400:
 *         description: Title and description are required
 *       500:
 *         description: Error creating workshop
 */
router.post('/', auth, checkRole('mentor'), async (req, res) => {
  // Validate input data
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).send('Title and description are required');
  }

  console.log('User Info:', req.user); // Log user data for debugging

  try {
    const workshop = new Workshop({
      title: req.body.title,
      description: req.body.description,
      mentorId: req.user.id, // Ensure that the user is a mentor
    });

    await workshop.save();
    res.send(workshop);
  } catch (err) {
    res.status(500).send('Error creating workshop');
  }
});

// Add an activity to a workshop (mentor only)
router.post('/activities', auth, checkRole('mentor'), async (req, res) => {
  const { title, description, schedule } = req.body;

  // Validate input data
  if (!title || !description || !schedule) {
    return res.status(400).send('Title, description, and schedule are required');
  }

  // Find the workshop by ID
  const workshop = await Workshop.findById(req.query.workshopId);
  if (!workshop) return res.status(404).send('Workshop not found.');

  try {
    // Create the new activity
    const activity = new Activity({
      title: req.body.title,
      description: req.body.description,
      schedule: req.body.schedule,
      workshopId: req.query.workshopId,
    });

    await activity.save();

    // Add activity to the workshop's activities array
    workshop.activities.push(activity._id);
    await workshop.save();

    res.send(activity);
  } catch (err) {
    res.status(500).send('Error adding activity to workshop');
  }
});

// Update an activity (mentor only)
router.put('/activities/:activityId', auth, checkRole('mentor'), async (req, res) => {
  const { title, description, schedule } = req.body;

  // Validate input data
  if (!title || !description || !schedule) {
    return res.status(400).send('Title, description, and schedule are required');
  }

  try {
    // Find and update activity
    const activity = await Activity.findByIdAndUpdate(req.params.activityId, {
      title,
      description,
      schedule,
    }, { new: true });

    if (!activity) return res.status(404).send('The activity with the given ID was not found.');

    res.send(activity);
  } catch (err) {
    res.status(500).send('Error updating activity');
  }
});

// Delete an activity (mentor only)
router.delete('/activities/:activityId', auth, checkRole('mentor'), async (req, res) => {
  try {
    const activity = await Activity.findByIdAndRemove(req.params.activityId);

    if (!activity) return res.status(404).send('The activity with the given ID was not found.');

    res.send(activity);
  } catch (err) {
    res.status(500).send('Error deleting activity');
  }
});

// Get a single activity
router.get('/activities/:activityId', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);

    if (!activity) return res.status(404).send('The activity with the given ID was not found.');

    res.send(activity);
  } catch (err) {
    res.status(500).send('Error retrieving activity');
  }
});

module.exports = router;
