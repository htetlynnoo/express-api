const prisma = require("../../../prismaClient");
const { faker } = require("@faker-js/faker");

async function FollowSeeder() {
    console.log("follow seeding started...");
    // Keep track of existing follows to avoid duplicates
    const existingFollows = new Set();

    // Each user will follow 2-4 other users
    for (
        let aPersonWhoFollowId = 1;
        aPersonWhoFollowId <= 5;
        aPersonWhoFollowId++
    ) {
        const numToFollow = faker.number.int({ min: 2, max: 4 }); //4
        let followed = 0;

        while (followed < numToFollow) {
            const aPersonWhoGotFollowedId = faker.number.int({
                min: 1,
                max: 5,
            });

            // Skip if user trying to follow themselves or if follow relationship already exists
            if (
                aPersonWhoFollowId === aPersonWhoGotFollowedId ||
                existingFollows.has(
                    `${aPersonWhoFollowId}-${aPersonWhoGotFollowedId}`
                )
            ) {
                continue;
            }

            await prisma.follow.create({
                data: {
                    aPersonWhoFollowId,
                    aPersonWhoGotFollowedId,
                },
            });

            existingFollows.add(
                `${aPersonWhoFollowId}-${aPersonWhoGotFollowedId}`
            );
            followed++;
        }
    }
    console.log("follow seeding done.");
}

module.exports = {
    FollowSeeder,
};
