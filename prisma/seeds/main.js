const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { faker } = require("@faker-js/faker");

const { UserSeeder } = require("./childSeeding/UserSeeder");
const { PostSeeder } = require("./childSeeding/PostSeeder");
const { CommentSeeder } = require("./childSeeding/CommentSeeder");
const { FollowSeeder } = require("./childSeeding/followSeeder");
const { LikeSeeder } = require("./childSeeding/likeSeeder");
const { NotificationSeeder } = require("./childSeeding/notificationSeeder");

async function main() {
    try {
        await UserSeeder();
        await PostSeeder();
        await CommentSeeder();

        await FollowSeeder();

        await LikeSeeder();
        await NotificationSeeder();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
