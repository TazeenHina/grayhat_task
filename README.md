# Workshop Management API

This repository contains the source code for a Workshop Management API. The API provides endpoints to manage workshops, learners, user authentication, and sign-up functionality. It includes integration with MongoDB and supports Swagger for API documentation.

## Features
- **Workshop Management**: CRUD operations for managing workshops.
- **Learner Management**: Manage learners participating in workshops.
- **Authentication**: Secure authentication using JSON Web Tokens (JWT).
- **Sign-Up**: Endpoint for new user registration.
- **Swagger Integration**: Interactive API documentation available at `/api-docs`.

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/)
- A `.env` file containing the JWT secret key.

## Installation
1. Clone the repository:
   ```bash
   git clone <(https://github.com/TazeenHina/grayhat_task)>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with the following content:
   ```env
   JWT_PRIVATE_KEY=your_jwt_secret_key
   ```

4. Configure MongoDB:
   Ensure MongoDB is running locally or update the connection string in the code to point to your MongoDB instance.

5. Start the server:
   ```bash
   npm start
   ```

6. Access the API documentation:
   Navigate to [http://localhost:3000/api-docs](http://localhost:3000/api-docs) in your browser.

## Configuration
Configuration is managed using the `config` package. The following files are used:
- `default.json`: Contains default configuration values.
- `custom_environment_variables.json`: Maps environment variables to configuration keys.

Example:
```json
{
    "jwtPrivateKey": "JWT_PRIVATE_KEY"
}
```

## Project Structure
- **routes/**: Contains route handlers for various API endpoints (e.g., `workshops`, `signup`, `learners`, `auth`).
- **swaggerConfig.js**: Configuration for Swagger documentation.
- **app.js**: Main entry point of the application.

## Available Routes
- **Workshops**: `/api/workshops`
- **Learners**: `/api/learners`
- **Sign-Up**: `/api/signup`
- **Authentication**: `/api/auth`

## Development
- Run the server in development mode:
  ```bash
  npm run dev
  ```
  This uses tools like `nodemon` to automatically reload the server on file changes.

## Testing
You can write and run tests using a framework like Jest or Mocha. Add your tests to a `tests/` directory.

## Dependencies
- [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from a `.env` file.
- [config](https://www.npmjs.com/package/config): Handles configuration management.
- [joi](https://www.npmjs.com/package/joi): Schema validation library.
- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express): Middleware for Swagger API documentation.
- [mongoose](https://www.npmjs.com/package/mongoose): MongoDB object modeling tool.
- [express](https://www.npmjs.com/package/express): Web application framework for Node.js.

## Troubleshooting
1. **FATAL ERROR: jwtPrivateKey is not defined**:
   Ensure the `JWT_PRIVATE_KEY` environment variable is set in the `.env` file or the system environment.

2. **Could not connect to MongoDB**:
   Verify that MongoDB is running and accessible at the specified connection string.

## License
This project is licensed under the [MIT License](LICENSE).

---
Feel free to contribute or raise issues to improve this project!

