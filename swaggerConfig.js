const swaggerJsdoc = require('swagger-jsdoc');

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0', // Specify OpenAPI version
    info: {
      title: 'Workshop Skills API', // API title
      version: '1.0.0', // API version
      description: 'API documentation for Workshop Skills' // Description
    },
    servers: [
      {
        url: 'http://localhost:3000', // Base URL for your API
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to your route files (modify if needed)
};

const swaggerSpecs = swaggerJsdoc(options);

module.exports = swaggerSpecs;
