// tests/routers/users.test.js
const request = require("supertest");
const express = require("express");
const { usersRouter } = require("../../routers/users");
const prisma = require("../../prismaClient");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(usersRouter);

let token;
let testUserId;

beforeAll(async () => {
    // Create a user to test login & auth
    const passwordHash = await require("bcrypt").hash("password123", 10);
    const user = await prisma.user.create({
        data: {
            name: "TestUser",
            username: "testuser",
            password: passwordHash,
        },
    });
    testUserId = user.id;
    token = jwt.sign({ id: testUserId }, process.env.JWT_SECRET);
});

afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: "testuser" } });
    await prisma.$disconnect();
});

describe("User Routes", () => {
    it("should register a new user", async () => {
        const res = await request(app).post("/register").send({
            name: "Alice",
            username: "alice123",
            password: "secret",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.username).toBe("alice123");

        // Clean up
        await prisma.user.delete({ where: { username: "alice123" } });
    });

    it("should login an existing user", async () => {
        const res = await request(app)
            .post("/login")
            .send({ username: "testuser", password: "password123" });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.username).toBe("testuser");
    });

    it("should get current user info via /verify", async () => {
        const res = await request(app)
            .get("/verify")
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(testUserId);
        expect(res.body.password).toBeUndefined();
    });

    it("should follow another user", async () => {
        // Create another user to follow
        const otherUser = await prisma.user.create({
            data: { name: "Bob", username: "bob123", password: "secret" },
        });

        const res = await request(app)
            .post(`/users/${otherUser.id}/follow`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.aPersonWhoFollowId).toBe(testUserId);

        // Clean up
        await prisma.follow.deleteMany();
        await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it("should unfollow a user", async () => {
        // Create another user and follow first
        const otherUser = await prisma.user.create({
            data: { name: "Jane", username: "jane123", password: "secret" },
        });

        await prisma.follow.create({
            data: {
                aPersonWhoFollowId: testUserId,
                aPersonWhoGotFollowedId: otherUser.id,
            },
        });

        const res = await request(app)
            .delete(`/users/${otherUser.id}/unfollow`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.aPersonWhoFollowId).toBe(testUserId);

        // Clean up
        await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it("should search users by name", async () => {
        const res = await request(app).get("/search?q=Test");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toContain("Test");
    });
});
