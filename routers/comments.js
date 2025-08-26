const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { auth, isOwner } = require("../middlewares/auth");
const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));

router.use(bodyParser.json());
const cors = require("cors");
router.use(cors());

// Create a new comment
router.post("/posts/:id/comments", auth, async (req, res) => {
    const postId = req.params.id;
    const userId = res.locals.user.id;
    const { content } = req.body;

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                postId: parseInt(postId),
                commentorId: userId,
            },
            include: {
                commentor: true,
            },
        });

        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a comment
router.delete("/comments/:id", auth, async (req, res) => {
    const commentId = parseInt(req.params.id);

    try {
        // Check if comment exists and user is the owner
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.commentorId !== res.locals.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Delete the comment
        await prisma.comment.delete({
            where: { id: commentId },
        });

        res.json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { commentsRouter: router };
