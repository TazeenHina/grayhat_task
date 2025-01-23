require('dotenv').config();  // Make sure dotenv is required at the top to load environment variables
const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const mongoose = require('mongoose');

const express = require('express');
const app = express();

// Swagger setup
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Workshop API',
      version: '1.0.0',
      description: 'API documentation for the Workshop app',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
};

// Options for swagger-jsdoc
const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'], // Path to the API docs (JSDoc comments in your routes)
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const signup = require('./routes/signup');
const workshops = require('./routes/workshops');
const learners = require('./routes/learners');
const auth = require('./routes/auth');

// JWT Private Key check (for environment variable)
if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost/workshopDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(express.json());
app.use('/api/workshops', workshops);
app.use('/api/signup', signup);
app.use('/api/learners', learners);
app.use('/api/auth', auth);

// Define the port for the server to listen on
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
