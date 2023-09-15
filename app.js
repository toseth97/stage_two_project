// Import required modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Create an Express application
const app = express();

// Set up MongoDB connection (Make sure you have MongoDB running)
connectDB().catch((err) => console.log(err.message));

async function connectDB() {
    await mongoose
        .connect(process.env.URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(console.log("DB connected"));
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
}

// Define a Person schema and model
const personSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
});

const Person = mongoose.model("Person", personSchema);

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

// CRUD operations

// CREATE: Adding a new person
app.post("/api", async (req, res) => {
    try {
        const { firstName, lastName, age } = req.body;
        console.log(req.body);
        const person = new Person({ firstName, lastName, age });
        const savedPerson = await person.save();
        res.json(savedPerson);
    } catch (error) {
        res.status(500).json({ error: "Could not create the person." });
    }
});

//READ: Fetching all users

app.get("/api", async (req, res) => {
    try {
        const people = await Person.find();
        if (people.length < 1) {
            return res.status(404).json({ error: "Userlist is empty" });
        }
        res.json(people);
    } catch (err) {
        res.json({ error: err.message });
    }
});

// READ: Fetching details of a person by ID
app.get("/api/:id", async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        if (!person) {
            return res.status(404).json({ error: "Person not found." });
        }
        res.json(person);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch the person." });
    }
});

// UPDATE: Modifying details of an existing person by ID
app.put("/api/:id", async (req, res) => {
    try {
        const { firstName, lastName, age } = req.body;
        const updatedPerson = await Person.findByIdAndUpdate(
            req.params.id,
            { firstName, lastName, age },
            { new: true } // Return the updated document
        );
        if (!updatedPerson) {
            return res.status(404).json({ error: "Person not found." });
        }
        res.json(updatedPerson);
    } catch (error) {
        res.status(500).json({ error: "Could not update the person." });
    }
});

// DELETE: Removing a person by ID
app.delete("/api/:id", async (req, res) => {
    try {
        const deletedPerson = await Person.findByIdAndRemove(req.params.id);
        if (!deletedPerson) {
            return res.status(404).json({ error: "Person not found." });
        }
        res.json({ message: "Person deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Could not delete the person." });
    }
});

// Start the Express server
const port = process.env.PORT || 3880;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
