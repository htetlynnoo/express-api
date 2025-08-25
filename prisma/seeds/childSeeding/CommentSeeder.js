const prisma = require("../../../prismaClient");
const { faker } = require("@faker-js/faker");

async function CommentSeeder() {
    console.log("comment seeding started...");
    for (let i = 0; i < 40; i++) {
        await prisma.comment.create({
            data: {
                content: faker.lorem.sentence(),
                postId: faker.number.int({ min: 1, max: 20 }),
                commentorId: faker.number.int({ min: 1, max: 5 }),
            },
        });
    }

    console.log("comment seeding done.");
}
module.exports = { CommentSeeder };
