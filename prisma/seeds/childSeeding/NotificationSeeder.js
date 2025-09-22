const prisma = require("../../../prismaClient");
const { faker } = require("@faker-js/faker");

async function NotificationSeeder() {
    // Add notifications seeding
    console.log("notification seeding started...");

    // Create sample notifications for likes
    for (let i = 0; i < 3; i++) {
        await prisma.notification.create({
            data: {
                type: "LIKE",
                content: "likes your post",
                receiverId: 5,
                actorId: faker.number.int({ min: 1, max: 4 }),
                postId: faker.number.int({ min: 1, max: 20 }),
                read: false,
                created: faker.date.recent({ days: 7 }),
            },
        });
    }

    // Create sample notifications for comments
    for (let i = 0; i < 2; i++) {
        await prisma.notification.create({
            data: {
                type: "COMMENT",
                content: "commented on your post",
                receiverId: 5,
                actorId: faker.number.int({ min: 1, max: 4 }),
                postId: faker.number.int({ min: 1, max: 20 }),
                read: false,
                created: faker.date.recent({ days: 7 }),
            },
        });
    }

    console.log("notification seeding done.");
}
module.exports = { NotificationSeeder };
