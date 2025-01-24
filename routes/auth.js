const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/user'); 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Authenticate users (learners/mentors) via JWT
 *     description: Authenticates a user and generates a JSON Web Token (JWT).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Successfully authenticated and returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated user
 *       400:
 *         description: Invalid email or password
 */

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({email: req.body.email});
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password,user.password);

  if(!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();

  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(50).required().email(),//calling email method to ensure that it is a valid email
    password: Joi.string().min(5).max(255).required()
    
  });

  return schema.validate(req);
}
module.exports = router; 