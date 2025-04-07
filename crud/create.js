const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.create({
        data: {
            name: "Alice",
            username: "alice",
            bio: "Alice Bio",
            posts: {
                create: [
                    { content: "First content from Alice" },
                    { content: "Second content from Alice" },
                ],
            },
        },
    });

    console.log(user);
}

main();
