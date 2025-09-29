require("dotenv").config({ path: ".env.test" });
const { execSync } = require("child_process");
const prisma = require("./prismaClient.js"); // adjust path if needed

// What it does: Imports the execSync function from Node.js child_process module.

// Why:

// execSync lets you run shell commands from Node.js synchronously (waits for them to finish before moving on).

// Reset DB schema before all tests
beforeAll(() => {
    console.log("🔄 Resetting test database...");
    execSync("npx prisma migrate reset --force --skip-seed", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
});
// { stdio: "inherit" }

// Shows the command output in your terminal, so you can see what Prisma is doing.

afterAll(async () => {
    await prisma.$disconnect();
});

// jest.setup.js runs automatically before all tests, so the DB reset happens without needing require('./dbsetup').
