const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { auth, isOwner } = require("../middlewares/auth");

router.get("/posts/following", auth, async (req, res) => {
    try {
        // Get posts from users that the current user follows
        const posts = await prisma.post.findMany({
            where: {
                user: {
                    followers: {
                        some: {
                            followerId: res.locals.user.id, // d user follow lote htr tk followers tway ko shr pr
                        },
                    },
                },
            },

            /*const posts = await prisma.post.findMany({
                where: {
                    user: { // Filter based on the user who created the post
                        followers: { // Access the "followers" relation of that user
                            some: { // Check if at least one follower matches
                                followerId: res.locals.user.id // The current user's ID (logged-in user)
                            }
                        }
                    }
                }
            });*/

            include: {
                user: true,
                likes: true,
                comments: {
                    include: { user: true },
                },
            },
            take: 20,
            orderBy: { id: "desc" },
        });

        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get("/posts", async (req, res) => {
    const posts = await prisma.post.findMany({
        include: {
            user: true,
            likes: true,
            comments: {
                include: { user: true },
            },
        },
        take: 20,
        orderBy: { id: "desc" },
    });

    res.json(posts);
});

router.get("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
        include: {
            user: true,
            likes: true,
            comments: {
                include: { user: true },
            },
        },
        where: { id: Number(id) },
    });

    res.json(post);
});

router.post("/posts", auth, async (req, res) => {
    const { content } = req.body;
    const user = res.locals.user;

    if (!content) {
        return res.status(400).json({ msg: "content is required" });
    }

    const post = await prisma.post.create({
        data: { content, userId: Number(user.id) },
        include: {
            user: true,
            likes: true,
            comments: {
                include: { user: true },
            },
        },
    });

    res.status(201).json(post);
});

router.delete("/posts/:id", auth, isOwner("post"), async (req, res) => {
    const { id } = req.params;

    const post = await prisma.post.delete({
        where: { id: Number(id) },
    });

    res.json(post);
});

router.post("/posts/:id/like", auth, async (req, res) => {
    const { id } = req.params;
    const user = res.locals.user;

    try {
        const like = await prisma.like.create({
            data: {
                postId: Number(id),
                userId: user.id,
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: { user: true },
                },
            },
        });

        res.json(post);
    } catch (err) {
        if (err.code === "P2002") {
            return res.status(400).json({ msg: "Already liked" });
        }
        res.status(500).json({ msg: err.message });
    }
});

router.delete("/posts/:id/like", auth, async (req, res) => {
    const { id } = req.params;
    const user = res.locals.user;

    try {
        const result = await prisma.like.deleteMany({
            where: {
                postId: Number(id),
                userId: user.id,
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
                likes: true,
                comments: {
                    include: { user: true },
                },
            },
        });

        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = { postsRouter: router };
