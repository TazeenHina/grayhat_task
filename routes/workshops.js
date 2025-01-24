const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const Workshop = require('../models/workshop');
const Activity = require('../models/activity');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Workshops
 *   description: API for managing workshops
 */

/**
 * @swagger
 * /api/workshops:
 *   get:
 *     summary: Get all workshops
 *     tags:
 *       - Workshops
 *     description: Retrieves a list of all workshops sorted by title.
 *     responses:
 *       200:
 *         description: A list of workshops.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique identifier of the workshop.
 *                   title:
 *                     type: string
 *                     description: The title of the workshop.
 *                   description:
 *                     type: string
 *                     description: A description of the workshop.
 *                   mentorId:
 *                     type: string
 *                     description: The unique identifier of the mentor leading the workshop.
 *                   activities:
 *                     type: array
 *                     items:
 *                       type: string
 *                       description: The unique identifiers of the activities associated with the workshop.
 *       500:
 *         description: Error retrieving workshops.
 */

router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort('title');
    res.send(workshops);
  } catch (err) {
    res.status(500).send('Error retrieving workshops');
  }
});

/**
 * @swagger
 * /api/workshops:
 *   post:
 *     summary: Create a new workshop
 *     tags:
 *       - Workshops
 *     description: Allows a mentor to create a new workshop with title and description.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the workshop
 *                 example: "Advanced JavaScript"
 *               description:
 *                 type: string
 *                 description: The description of the workshop
 *                 example: "A deep dive into modern JavaScript features and best practices."
 *     responses:
 *       200:
 *         description: Successfully created a new workshop.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the workshop.
 *                 title:
 *                   type: string
 *                   description: The title of the workshop.
 *                 description:
 *                   type: string
 *                   description: The description of the workshop.
 *                 mentorId:
 *                   type: string
 *                   description: The ID of the mentor who created the workshop.
 *       400:
 *         description: Title and description are required.
 *       500:
 *         description: Internal server error while creating the workshop.
 */

router.post('/', auth, checkRole('mentor'), async (req, res) => {
    // Validate input data
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send('Title and description are required');
    }
  
    try {
      // Create a new workshop with mentor's ID from req.user
      const workshop = new Workshop({
        title: req.body.title,
        description: req.body.description,
        mentorId: req.user._id,  // Ensure that the user is a mentor
      });
  
      // Save the workshop
      await workshop.save();
  
      // Send the created workshop as the response
      res.send(workshop);
    } catch (err) {
      console.error('Error creating workshop:', err);
      res.status(500).send('Error creating workshop');
    }
  });
  

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: API for managing activities in workshops
 */

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Add an activity to a workshop
 *     tags:
 *       - Activities
 *     description: Allows a mentor to add an activity to a specific workshop.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the activity.
 *               description:
 *                 type: string
 *                 description: A description of the activity.
 *               schedule:
 *                 type: string
 *                 description: The schedule for the activity (date and time).
 *     parameters:
 *       - in: query
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workshop where the activity will be added.
 *     responses:
 *       200:
 *         description: Successfully added activity to the workshop.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the activity.
 *                 title:
 *                   type: string
 *                   description: The title of the activity.
 *                 description:
 *                   type: string
 *                   description: A description of the activity.
 *                 schedule:
 *                   type: string
 *                   description: The schedule for the activity.
 *                 workshopId:
 *                   type: string
 *                   description: The ID of the workshop the activity belongs to.
 *       400:
 *         description: Title, description, and schedule are required.
 *       404:
 *         description: Workshop not found.
 *       500:
 *         description: Internal server error.
 */

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
/**
 * @swagger
 * /api/activities/{activityId}:
 *   put:
 *     summary: Update an activity in a workshop
 *     tags:
 *       - Activities
 *     description: Allows a mentor to update the details of an activity within a workshop.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the activity to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the activity.
 *               description:
 *                 type: string
 *                 description: A description of the activity.
 *               schedule:
 *                 type: string
 *                 description: The updated schedule for the activity (date and time).
 *     responses:
 *       200:
 *         description: Successfully updated the activity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the activity.
 *                 title:
 *                   type: string
 *                   description: The title of the activity.
 *                 description:
 *                   type: string
 *                   description: A description of the activity.
 *                 schedule:
 *                   type: string
 *                   description: The updated schedule for the activity.
 *                 workshopId:
 *                   type: string
 *                   description: The ID of the workshop the activity belongs to.
 *       400:
 *         description: Title, description, and schedule are required.
 *       404:
 *         description: Activity not found.
 *       500:
 *         description: Internal server error.
 */

// Update an activity (mentor only)
router.put('/activities/', auth, checkRole('mentor'), async (req, res) => {
  const { title, description, schedule } = req.body;

  // Validate input data
  if (!title || !description || !schedule) {
    return res.status(400).send('Title, description, and schedule are required');
  }

  try {
    // Find and update activity
    const activity = await Activity.findByIdAndUpdate(req.query.activityId, {
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
/**
 * @swagger
 * /api/activities/{activityId}:
 *   delete:
 *     summary: Delete an activity from a workshop
 *     tags:
 *       - Activities
 *     description: Allows a mentor to delete an activity from a workshop.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the activity to be deleted.
 *     responses:
 *       200:
 *         description: Successfully deleted the activity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the deleted activity.
 *                 title:
 *                   type: string
 *                   description: The title of the deleted activity.
 *                 description:
 *                   type: string
 *                   description: A description of the deleted activity.
 *                 schedule:
 *                   type: string
 *                   description: The schedule for the deleted activity.
 *                 workshopId:
 *                   type: string
 *                   description: The ID of the workshop the activity belonged to.
 *       404:
 *         description: Activity not found.
 *       500:
 *         description: Internal server error.
 */

// Delete an activity (mentor only)
router.delete('/activities/', auth, checkRole('mentor'), async (req, res) => {
    try {
      
      const activity = await Activity.findByIdAndDelete(req.query.activityId);
  
      if (!activity) return res.status(404).send('The activity with the given ID was not found.');

      await Workshop.updateMany(
        { activities: req.query.activityId },  // Find all workshops that have this activity
        { $pull: { activities: req.query.activityId } }  // Remove the activity from the activities array
      );
  
      res.send(activity);  // Respond with the deleted activity or a success message
    } catch (err) {
      console.error(err);  // Log the error for debugging
      res.status(500).send('Error deleting activity');
    }
  });
  
/**
 * @swagger
 * /api/activities/{activityId}:
 *   get:
 *     summary: Retrieve a single activity from a workshop
 *     tags:
 *       - Activities
 *     description: Retrieve the details of a specific activity by its ID.
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the activity to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the activity details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the activity.
 *                 title:
 *                   type: string
 *                   description: The title of the activity.
 *                 description:
 *                   type: string
 *                   description: A description of the activity.
 *                 schedule:
 *                   type: string
 *                   description: The schedule for the activity.
 *                 workshopId:
 *                   type: string
 *                   description: The ID of the workshop the activity belongs to.
 *       404:
 *         description: Activity not found.
 *       500:
 *         description: Internal server error.
 */

// Get a single activity
router.get('/activities/', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.query.activityId);

    if (!activity) return res.status(404).send('The activity with the given ID was not found.');

    res.send(activity);
  } catch (err) {
    res.status(500).send('Error retrieving activity');
  }
});

module.exports = router;
