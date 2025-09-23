// index.js
const express = require("express");
const { $disconnect } = require("./prismaClient");
const bodyParser = require("body-parser");
const cors = require("cors");

const { usersRouter } = require("./routers/users");
const { postsRouter } = require("./routers/posts");
const { commentsRouter } = require("./routers/comments");
const { auth, isOwner } = require("./middlewares/auth");

const app = express();

// Body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS
app.use(cors());

// Routers
app.use(usersRouter);
app.use(postsRouter);
app.use(commentsRouter);

// Middlewares
app.use(auth, isOwner);

// Start server
const server = app.listen(8080, () => {
    console.log("Express is running at 8080");
});

// Graceful shutdown
const gracefulShutdown = async () => {
    await $disconnect();
    console.log("Disconnected from the database");
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Export app
module.exports = app;
