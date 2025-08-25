const prisma = require("../../../prismaClient");
const { faker } = require("@faker-js/faker");

async function LikeSeeder() {
    console.log("like seeding started...");
    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();
    const usedCombinations = new Set();

    for (let i = 0; i < 30; i++) {
        let actorId, postId;
        let combinationKey;

        //prevents duplicate and Set() gives u unique

        do {
            actorId =
                users[faker.number.int({ min: 0, max: users.length - 1 })].id;
            postId =
                posts[faker.number.int({ min: 0, max: posts.length - 1 })].id;
            combinationKey = `${actorId}-${postId}`;
        } while (usedCombinations.has(combinationKey));

        usedCombinations.add(combinationKey);

        try {
            await prisma.like.create({
                data: {
                    actorId,
                    postId,
                },
            });
        } catch (error) {
            console.log(
                `Skipping duplicate like for user ${actorId} and post ${postId}`
            );
            continue;
        }
    }

    console.log("like seeding done.");
}
module.exports = {
    LikeSeeder,
};
