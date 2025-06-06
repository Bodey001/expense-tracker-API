# Expense Tracker API
A simple and robust RESTful API for tracking user expenses, built with Node.js and Express.js, and leveraging MongoDB for data persistence. This API provides the backend logic for managing expenses, categories, and user authentication, designed to be consumed by various client applications (web, mobile, or desktop).

## Table of Contents

-   [Features](features)
-   [Technologies Used](#technologies-used)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Configuration](#configuration)
    -   [Running the Application](#running-the-application)
-   [API Endpoints](#api-endpoints)
    -   [Users](#users)
    -   [Categories](#categories)
    -   [Expenses](#expenses)
-   [Error Handling](#error-handling)
-   [Contributing](#contributing)
-   [License](#license)
-   [Contact](#contact)

## Features
This API supports the following core functionalities:

User Authentication:
    -   User registration (signup)
    -   User login
    -   JWT-based authentication for secure API access
    -   Password hashing using bcrypt

User Management:
    -   Update user profile information.
    -   Delete user accounts.

Category Management:
    -   Create custom expense categories.
    -   Retrieve categories associated with a user.
    -   Update category details (title or description).
    -   Delete categories.

Expense Management:
    -   Create new expenses with details.
    -   Retrieve expenses, including filtering by category title.
    -   Update existing expenses.
    -   Delete expenses.

Database Integration:
    -   MongoDB as the primary database.
    -   Mongoose for elegant MongoDB object modeling.

## Techonologies Used
-   Node.js: JavaScript runtime environment.
-   Express.js: Fast, unopinionated, minimalist web framework for Node.js.
-   MongoDB: NoSQL document database.
-   Mongoose: MongoDB object data modeling (ODM) for Node.js.
-   JWT (JSON Web Tokens): For secure API authentication.
-   Bcrypt: For secure password hashing.
-   Dotenv: For managing environment variables.
-   Cookie-parser: Middleware for parsing cookies.
-   Nodemailer: For sending emails (e.g., for password recovery, user verification - functionality implied but not explicitly shown in current endpoints).
-   Nodemon: (Development) Tool for automatically restarting the server during development.

## Prerequisites
Before you begin, ensure you have met the following requirements:
-   Node.js: v14.x or higher installed. You can download it from nodejs.org.
-   npm (Node Package Manager): Comes bundled with Node.js.
-   MongoDB: A running MongoDB instance. You can:
    -   Install it locally: MongoDB Community Edition
    -   Use a cloud service: MongoDB Atlas (recommended for ease of setup)

## Installation
1. Clone the respository:

``` bash
git clone [https://github.com/Bodey001/expense-tracker-api]
cd [expense-tracker-api] 
```

2. Install dependencies:
`npm install`

## Configuration
This project uses dotenv to manage environment variables. Create a .env file in the root directory of the project and add the following variables:

PORT=your_port

DB_PORT=your_mongoDB_port
DB_HOST=your_mongoDB_host
DB_NAME=your_mongoDB_database_name

JWT_SECRET_KEY=your_jwt_secret_key

SALTROUNDS=your_preferred_saltRounds

EMAIL_USER=your_email_service_provider_address
EMAIL_PASS=your_email_service_provider_password


## Running the Application
-   Development Mode
For development, nodemon is used to automatically restart the server on code changes.

`npm run dev`

The API will be accessible at http://localhost:<PORT> (e.g., http://localhost:5000).

- Production Mode
To run the application in production, use the start script.

`npm start`

The API will be accessible at http://localhost:<PORT>.

## API Endpoints
This section outlines the main API endpoints provided by the expense-tracker-api. All endpoints are prefixed with /v1 as defined in app.js.

### Authentication
-   POST /v1/create-user
    -   Description: Registers a new user account.
    -   Controller Function: userControllers.createUser
    -   Request Body Example:
        {
        "username": "newuser",
        "email": "new.user@example.com",
        "password": "strongpassword123"
        }

-   POST /v1/login
    -   Description: Authenticates a user (using either email or username) and returns a JSON Web Token (JWT) for subsequent authenticated requests.
    -   Controller Function: userControllers.userLogin
    -   Request Body Example:
        {
        "username": "newuser",
        "email": "new.user@example.com",
        "password": "strongpassword123"
        }

### Users
-   POST /v1/users/update-user
    -   Description: Updates the profile details of the authenticated user.
    -   Controller Function: userControllers.updateUserInformation
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "username": "updated_username",
        "email": "updated.email@example.com"
        }

-   POST /v1/users/delete-user
    -   Description: Deletes the authenticated user's account.
    -   Controller Function: userControllers.deleteUser
    -   Requires: Authentication.

### Categories
-   POST /v1/categories/create-category
    -   Description: Creates a new expense category for the authenticated user.
    -   Controller Function: categoryControllers.createCategory
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "title": "Transportation",
        "description": "Expenses related to travel and commute."
        }

-   GET /v1/categories/get-categories
    -   Description: Retrieves all categories associated with the authenticated user.
    -   Controller Function: categoryControllers.getCategories
    -   Requires: Authentication.

-   POST /v1/categories/update-category
    -   Description: Updates an existing category's title or description.
    -   Controller Function: categoryControllers.updateCategory
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "title": "Transportation",
        "newTitle": "Transport (Updated)",
        "description": "Updated description for transport expenses."
        }

-   POST /v1/categories/delete-category-title
    -   Description: Deletes a category by its title.
    -   Controller Function: categoryControllers.deleteCategory
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "title": "Transportation"
        }


### Expenses
-   POST /v1/expenses/add-expense
    -   Description: Creates a new expense for the authenticated user.
    -   Controller Function: expenseControllers.createExpense
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "title": "Food",
        "amount": 25.50,
        "description": "Coffee and pastry",
        }

-   POST /v1/expenses/find-expenses
    -   Description: Retrieves expenses filtered by a specific category title for the authenticated user.
    -   Controller Function: expenseControllers.getExpensesByCategoryTitle
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "title": "Food"
        }

-   POST /v1/expenses/update-expense
    -   Description: Updates an existing expense.
    -   Controller Function: expenseControllers.updateExpense
    -   Requires: Authentication.
    -   Request Body Example (Assuming ID is passed in body or route):
        {
        "id": "6543210abcdef1234567890ff",
        "newTitle": "New Title",
        "newAmount": 30.00,
        "newDescription": "Updated coffee and lunch",
        }

-   POST /v1/expenses/delete-expense
    -   Description: Deletes an expense.
    -   Controller Function: expenseControllers.deleteExpense
    -   Requires: Authentication.
    -   Request Body Example:
        {
        "id": "6543210abcdef1234567890ff"
        }


## Error Handling
The API returns standard HTTP status codes for responses:
-   2xx for successful requests.
-   4xx for client-side errors (e.g., validation errors, authentication failure, not found).
-   5xx for server-side errors.

Error responses typically include a message field with details about the error.

## Contributing
Contributions are welcome! If you'd like to contribute, please follow these steps:
-   Fork the repository.
-   Create a new branch (git checkout -b feature/your-feature-name).
-   Make your changes.
-   Commit your changes (git commit -m 'feat: Add new feature').
-   Push to the branch (git push origin feature/your-feature-name).
-   Open a Pull Request.

Please ensure your code adheres to the project's coding style and includes appropriate tests if applicable.

## License
This project is licensed under the ISC License. See the LICENSE file for details.

## Contact
For any questions or inquiries, please contact:
Olabode - [oyewunmi1010@gmail.com] - (Optional: [https://github.com/Bodey001])