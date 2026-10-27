
const Note = require("./models/notes");
const User = require("./models/users");
const mongoose = require("mongoose");

const MONGO_URL = "mongodb://127.0.0.1:27017/notes-app";

const notes = [
    {
        title: "Learning DSA",
        description: "Learning DSA daily for logic building to help in interviews"
    },
    {
        title: "Learning Web-Dev",
        description: "Learning Web-Dev for building real working solutions"
    },
    {
        title: "Hit Gym",
        description: "Hit Gym 4 days in a week for building a better body"
    },
    {
        title: "Running Daily",
        description: "Run daily at least 2km to stay healthy and fit"
    },
    {
        title: "Maintain Diet",
        description: "Maintain a proper diet and avoid sugary items"
    },
    {
        title: "Learning CS Fundamentals",
        description: "Learn CS fundamentals daily to prepare for interviews"
    },
    {
        title: "Proper Sleep",
        description: "Maintain proper sleep of at least 7 hours"
    },
    {
        title: "Read Book",
        description: "Read at least 15 pages daily to gain knowledge"
    }
];

async function seedDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/notes-app");

        // 1. Clear existing data
        await Note.deleteMany({});
        await User.deleteMany({});

   const user = await User.create({
    email: "vishnu@example.com"
});

console.log("Created user:", user);
console.log("User ID:", user._id);

const userNotes = notes.map(note => ({
    ...note,
    user: user._id
}));


await Note.insertMany(userNotes);


        console.log("Notes and user seeded successfully!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.connection.close();
    }
}

seedDB();