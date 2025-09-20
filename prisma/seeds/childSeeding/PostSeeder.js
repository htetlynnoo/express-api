const prisma = require("../../../prismaClient");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Absolute path to your images folder
const imagesDir = path.join(os.homedir(), "Desktop", "superbase");

// Read all files in the folder
const imageFiles = fs.readdirSync(imagesDir);

// Function to get a random local image path
function randomLocalImage() {
    const fileName = faker.helpers.arrayElement(imageFiles);
    return path.join(imagesDir, fileName);
}

const { createClient } = require("@supabase/supabase-js");
const superbase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function upLoadToSupabase(buffer, filename, mimetype = "image/jpeg") {
    const { data, error } = await superbase.storage
        .from("images")
        .upload(`public/${filename}`, buffer, {
            contentType: mimetype,
            upsert: true,
        });

    if (error) throw new Error(error.message);

    const publicURL = await superbase.storage
        .from("images")
        .getPublicUrl(data.path).data.publicUrl;

    return publicURL;
}

async function PostSeeder() {
    console.log("Post seeding started.....");

    for (let i = 0; i < 20; i++) {
        const filePath = randomLocalImage();
        const fileName = path.basename(filePath);
        const fileBuffer = fs.readFileSync(filePath);

        const publicURL = await upLoadToSupabase(fileBuffer, fileName);

        await prisma.post.create({
            data: {
                content: faker.lorem.paragraph(),
                picture: publicURL,
                userId: faker.number.int({ min: 1, max: 5 }),
            },
        });
    }
    console.log("Post seeding is done");
}

module.exports = { PostSeeder };
