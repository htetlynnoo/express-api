const express = require("express");
const app = express();


const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());
const { usersRouter } = require("./routers/users");
const { postsRouter } = require("./routers/posts");
const { commentsRouter } = require("./routers/comments");

app.use(usersRouter);
app.use(postsRouter);
app.use(commentsRouter);

app.listen(8080, () => {
    console.log("Express is running at 8080");
});

app.post("/posts/:id/like", auth, async (req, res) => {
    const { id } = req.params;
    const user = res.locals.user; // dr ka auth htl ka nay lr tr

    try {
        const like = await prisma.like.create({
            data: {
                postId: Number(id),
                userId: user.id,
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: { user: true, likes: true },
        });
        res.json(post);
    } catch (err) {
        if (err.code === "P002") {
            return res.status(400).json({ msg: "Already Liked" });
        }
        res.status(500).json({ msg: err.message });
    }
});

app.delete("/posts/:id/like", auth, async (req, res) => {
    const { id } = req.params;
    const user = res.locals.user; // dr ka auth htl ka nay lr tr

    try {
        await prisma.like.deleteMany({
            where: {
                postId: Number(id),
                userId: user.id,
            },
        });

        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: { user: true, likes: true },
        });
        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});
