const auth =  require('../middleware/auth'); 
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const Enrollment = require('../models/enrollment');
const {Workshop} = require('../models/workshop'); 
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Users-SignUp
 *   description: API for user management
 */

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Register a new user (learner or mentor)
 *     tags:
 *       - Users-SignUp
 *     description: Registers a new user by providing their name, email, password, and role (learner or mentor).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: secret123
 *               role:
 *                 type: string
 *                 description: The role of the user ('learner' or 'mentor')
 *                 example: learner
 *     responses:
 *       200:
 *         description: Successfully registered the user and returned a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user's unique identifier.
 *                 name:
 *                   type: string
 *                   description: The user's name.
 *                 email:
 *                   type: string
 *                   description: The user's email address.
 *                 role:
 *                   type: string
 *                   description: The user's role.
 *                 x-auth-token:
 *                   type: string
 *                   description: JWT token for the newly registered user.
 *       400:
 *         description: User already registered or validation error.
 *       500:
 *         description: Internal server error.
 */

router.post('/', async (req, res) => {
    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['name','email','password','role'])
    );
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id','name','email','role']));//this returns a new object with only these properties;
});

module.exports = router; 