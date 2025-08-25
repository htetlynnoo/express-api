const prisma = require("../../../prismaClient");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

async function UserSeeder() {
    console.log("user seeding started...");
    for (let i = 0; i < 5; i++) {
        const hash = await bcrypt.hash("password", 10);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        await prisma.user.create({
            data: {
                name: `${firstName} ${lastName}`,
                username: `${firstName}${lastName[0]}`.toLowerCase(),
                bio: faker.person.bio(),
                password: hash,
            },
        });
    }
    console.log("user data seeding is done");
}
module.exports = { UserSeeder };
