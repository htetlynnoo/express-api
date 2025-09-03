const express = require("express");

const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/***
 * @type {express.RequestHandler}
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

async function auth(req, res, next) {
    const authorization = req.headers.authorization;
    const token = authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "token is required" });
    }

    try {
        //const user = jwt.verify(token, process.env.JWT_SECRET);
        //res.locals.user = user; //dr u ya tk akyg ayin ka post lote tk akhr kya lote tk user id nk token htl mhr shi tk id ko pass lote pay lite chin loh example alice ka post yin alice yk id ko pay lite chin tl
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get fresh user data with counts
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                _count: {
                    select: {
                        following: true,
                        followers: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Add counts to user object
        res.locals.user = {
            ...user,
            followersCount: user._count.followers,
            followingCount: user._count.following,
        };
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).json({ msg: "invalid token" });
    }
}

function isOwner(type) {
    return async (req, res, next) => {
        const { id } = req.params;
        const user = res.locals.user;

        if (type == "post") {
            await prisma.like.deleteMany({
                where: { postId: Number(id) },
            });
            await prisma.comment.deleteMany({
                where: { postId: Number(id) },
            });
            const post = await prisma.post.findUnique({
                where: { id: Number(id) },
            });

            if (post.userId == user.id) return next();
        }

        if (type == "comment") {
            const comment = await prisma.comment.findUnique({
                where: { id: Number(id) },
                include: { post: true },
            });

            if (
                comment.commentorId == user.id ||
                comment.post.userId == user.id
            )
                return next();
        }
    };
}
module.exports = { auth, isOwner };
