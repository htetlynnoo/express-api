const prisma = require("../../prismaClient"); // adjust path if needed

// -------------------- USER TESTS --------------------

// Required fields
test("User requires a username", async () => {
    await expect(
        prisma.user.create({
            data: { name: "Alice", password: "secret" }, // missing username
        })
    ).rejects.toThrow();
});

// Unique constraint
test("User.username must be unique", async () => {
    await prisma.user.create({
        data: { name: "Alice", username: "alice123", password: "secret" },
    });

    await expect(
        prisma.user.create({
            data: {
                name: "Another",
                username: "alice123",
                password: "secret2",
            },
        })
    ).rejects.toThrow();
});

// Default created date
test("User.created is automatically set", async () => {
    const user = await prisma.user.create({
        data: { name: "Eve", username: "eve123", password: "secret" },
    });

    expect(user.created).toBeInstanceOf(Date);
});

// -------------------- POST TESTS --------------------
test("Post must belong to a User", async () => {
    const user = await prisma.user.create({
        data: { name: "Bob", username: "bob123", password: "secret" },
    });

    const post = await prisma.post.create({
        data: { content: "Hello World", picture: "img.png", userId: user.id },
    });

    expect(post.userId).toBe(user.id);
});

// -------------------- FOLLOW TESTS --------------------
test("User can follow another user", async () => {
    const user1 = await prisma.user.create({
        data: { name: "John", username: "john123", password: "secret" },
    });

    const user2 = await prisma.user.create({
        data: { name: "Jane", username: "jane123", password: "secret" },
    });

    const follow = await prisma.follow.create({
        data: {
            aPersonWhoFollowId: user1.id,
            aPersonWhoGotFollowedId: user2.id,
        },
    });

    expect(follow.aPersonWhoFollowId).toBe(user1.id);
    expect(follow.aPersonWhoGotFollowedId).toBe(user2.id);
});

// -------------------- NOTIFICATION TESTS --------------------
test("Notification can be created for a post", async () => {
    const user = await prisma.user.create({
        data: { name: "Tom", username: "tom123", password: "secret" },
    });

    const post = await prisma.post.create({
        data: { content: "Hi", picture: "pic.png", userId: user.id },
    });

    const notification = await prisma.notification.create({
        data: {
            type: "LIKE",
            content: "Someone liked your post",
            receiverId: user.id,
            actorId: user.id,
            postId: post.id,
        },
    });

    expect(notification.receiverId).toBe(user.id);
    expect(notification.postId).toBe(post.id);
    expect(notification.read).toBe(false);
});
