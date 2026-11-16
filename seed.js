require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Item = require("./models/Item");

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany();
        await Item.deleteMany();

        // Create a test admin user
        await User.create({
            username: "TestAdmin",
            email: "admin@test.com",
            password: "$2b$10$YourHashedPasswordHerePlaceholder", // or let app handle registration
            role: "admin"
        });

        // Create sample inventory items for EVENT-UALLY DONE
        await Item.create([
            {
                item_name: "HD Projector",
                category: "Audio/Visual",
                quantity: 5,
                available_quantity: 5,
                description: "High-definition portable projector for presentations."
            },
            {
                item_name: "Wireless Microphone",
                category: "Audio",
                quantity: 10,
                available_quantity: 10,
                description: "Dual channel handheld wireless mic system."
            },
            {
                item_name: "Folding Chairs (Pack of 10)",
                category: "Furniture",
                quantity: 25,
                available_quantity: 25,
                description: "Durable white plastic folding chairs."
            }
        ]);

        console.log("Database seeded successfully with EVENT-UALLY DONE items!");
        process.exit();
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seedData();