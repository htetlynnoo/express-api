const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

let clients = [];

router.ws("/subscribe", function (ws, req) {
    console.log("web socket connection received");
    ws.on("message", function (msg) {
        console.log(msg);
        const { token } = JSON.parse(msg);

        jwt.verify(token, secret, (err, user) => {
            if (err) return false;

            clients.push({ userId: user.id, ws });
            console.log(`WS: Client added: ${user.id}`);
        });
    });
});

module.exports = { clients, wsRouter: router };
