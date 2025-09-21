import express from "express";
const app = express();
import { $disconnect } from "./prismaClient";

import { urlencoded, json } from "body-parser";
app.use(urlencoded({ extended: false }));
app.use(json());

import cors from "cors";
app.use(cors());

import { usersRouter } from "./routers/users";
app.use(usersRouter); //router name thet mht yan

import { postsRouter } from "./routers/posts";
app.use(postsRouter);

import { commentsRouter } from "./routers/comments";
app.use(commentsRouter);

import { auth, isOwner } from "./middlewares/auth";
app.use(auth, isOwner);

app.get("/", (req, res) => {
    res.send("Express ");
});

// app.listen(8080, () => {
//     console.log("Express is running at 8080");
// });

// const gracefulShutdown = async () => {
//     await $disconnect();
//     console.log("Disconnected from the database");
//     server.close(() => {
//         console.log("Server closed");
//         process.exit(0);
//     });
// };

// process.on("SIGINT", gracefulShutdown);
// process.on("SIGTERM", gracefulShutdown);

export default app;
