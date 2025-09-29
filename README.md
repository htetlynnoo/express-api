# Express API

-   A RESTful API built with Node.js and Express, utilizing Prisma for database management.

## 🚀 Features

-   RESTful API endpoints

-   CRUD operations

-   Prisma ORM for database interaction

-   CI/CD pipeline integration (Vercel)

## 🛠️ Tech Stack

-   Node.js

-   Express.js

-   Prisma ORM

-   PostgreSQL(Neon)

-   Docker

-   Vercel (for deployment)

-   Supabase(for storage)

-   Jest (testing)
-   CI/CD Pipeline (GitActions)

## 📦 Installation

1. Clone the repository

-   git clone https://github.com/htetlynnoo/express-api.git
-   cd express-api

2. Install dependencies

-   npm install

3. Set up environment variables

-   Create a .env file in the root directory and add your database connection string:

-   DATABASE_URL="your-database-connection-string"
-   Create supabase for image storage and get service role key and url
-   SUPABASE_URL = "abcd"

-   SUPABASE_KEY= "abcd"

-   SUPABASE_SERVICE_ROLE_KEY = "abcd"
-   Create another .env.test for tesing db
-   DATABASE_URL="your-database-connection-string"

4. Run migrations

-   npx prisma migrate dev

5. Start the application

-   npm start or npx nodemon index.js

-   The API will be running at http://localhost:3000.

## 🧪 Running Tests

-   To run tests, use:

-   npm test (which is not preferred because it will run in the CI/CD so you can test only one time when setup later no need to)

## 🐳 Docker Setup

-   To build and run the application in a Docker container:

-   docker-compose up --build

-   This will start the API and Nginx in separate containers.

## 🚀 Deployment

-   This project is configured for deployment on Vercel. Upon pushing changes to the main branch, Vercel will automatically build and deploy the application.

## 📂 Project Structure

-   src/: Source code for the application

-   middlewares/: Middleware functions

-   prisma/: Prisma schema and client

-   routers/: API route definitions

-   Dockerfile: Docker configuration

-   docker-compose.yml: Docker Compose configuration

-   nginx.conf: Nginx configuration

-   package.json: Node.js dependencies and scripts

-   prismaClient.js: Prisma client initialization

-   start.sh: Shell script to start the application

-   vercel.json: Vercel deployment configuration

## 📄 License

-   This project is licensed under the MIT License.
