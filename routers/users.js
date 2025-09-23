const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { auth } = require("../middlewares/auth");

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));

router.use(bodyParser.json());

const cors = require("cors");
router.use(cors());

router.get("/verify", auth, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: res.locals.user.id },
        include: {
            _count: {
                select: {
                    following: true,
                    followers: true,
                },
            },
        },
    });
    res.json(user);
});

router.get("/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                posts: {
                    orderBy: { id: "desc" },
                    include: {
                        user: true,
                        likes: true,
                        comments: {
                            include: { commentor: true },
                        },
                    },
                },
                followers: true,
                _count: {
                    select: {
                        following: true,
                        followers: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post("/register", async (req, res) => {
    const { name, username, bio, password } = req.body;

    if (!name) {
        console.log("no name");
    }
    if (!name || !username || !password) {
        return res
            .status(400)
            .json({ msg: "name, username and password are required" });
    }

    const check = await prisma.user.findUnique({
        where: { username },
    });

    if (check) return res.status(400).json({ msg: "Username already exited" });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { name, username, bio, password: hash },
    });

    res.status(201).json(user);
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ msg: "username and password are required" });
    }

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return res.status(404).json({ msg: "user not found" });
    }

    // Check if the password is correct by comparing the hashed password with the one provided
    if (await bcrypt.compare(password, user.password)) {
        // Generate token and return user details
        res.json({
            token: jwt.sign(user, process.env.JWT_SECRET),
            user,
        });
    } else {
        res.status(401).json({ msg: "invalid password" });
    }
});

router.post("/users/:id/follow", auth, async (req, res) => {
    const aPersonWhoFollowId = res.locals.user.id;
    const aPersonWhoGotFollowedId = parseInt(req.params.id);

    try {
        if (aPersonWhoFollowId === aPersonWhoGotFollowedId) {
            return res.status(400).json({ error: "Cannot follow yourself" });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: aPersonWhoGotFollowedId },
        });

        if (!targetUser) {
            return res.status(404).json({
                error: "There is no such kind of user you want to follow",
            });
        }

        const followUser = await prisma.follow.create({
            data: {
                aPersonWhoFollowId,
                aPersonWhoGotFollowedId,
            },
        });

        return res.status(201).json(followUser);
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Already Following user" });
        }

        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

router.delete("/users/:id/unfollow", auth, async (req, res) => {
    const aPersonWhoFollowId = res.locals.user.id;
    const aPersonWhoGotFollowedId = parseInt(req.params.id);

    try {
        if (aPersonWhoFollowId === aPersonWhoGotFollowedId) {
            return res.status(400).json({ error: "cannot unfollow yourself" });
        }

        const unfollowUser = await prisma.follow.delete({
            where: {
                aPersonWhoFollowId_aPersonWhoGotFollowedId: {
                    aPersonWhoFollowId,
                    aPersonWhoGotFollowedId,
                },
            },
        });
        return res.status(201).json(unfollowUser);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(400).json({ error: "Not follow this user yet" });
        }

        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

//search
router.get("/search", async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
        return res
            .status(400)
            .json({ error: "Query parameter 'q' is missing" });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: q,
                },
            },
            include: {
                following: true,
                followers: true,
            },
            take: 20,
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

//notifations

router.get("/notis", auth, async (req, res) => {
    const { id } = res.locals.user;

    try {
        const notiData = await prisma.notification.findMany({
            where: {
                receiverId: Number(id),
            },
            include: {
                actor: true,
            },
            take: 20,
            orderBy: { id: "desc" },
        });
        return res.status(200).json(notiData);
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.put("/notis/readall", auth, async (req, res) => {
    const { id } = res.locals.user;

    await prisma.notification.updateMany({
        where: {
            receiverId: Number(id),
        },
        data: {
            read: true,
        },
    });
    res.status(201).json({ msg: "all notifications are read" });
});

router.put("/notis/:id/read", auth, async (req, res) => {
    const { id } = req.params;
    console.log("ID type:", typeof Number(id), "Value:", Number(id));

    try {
        const notiRead = await prisma.notification.update({
            where: { id: Number(id) },
            data: { read: true },
        });

        res.status(200).json(notiRead);
        console.log("readnoti", notiRead);
    } catch (error) {
        console.error("my error", error);
        res.status(404).json({ error: "Notification not found" });
    }
});

async function addNoti({ type, content, receiverId, postId, actorId }) {
    if (Number(receiverId) === Number(actorId)) return false;

    return await prisma.notification.create({
        data: {
            type,
            content,

            receiverId: Number(receiverId),
            postId: Number(postId),
            actorId: Number(actorId),
        },
    });
}

module.exports = { usersRouter: router, addNoti };
