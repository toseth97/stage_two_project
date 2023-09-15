require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3880;

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

const personSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
});

const Person = mongoose.model("Person", personSchema);

app.use(bodyParser.json());

// Middleware for validating the name field
function validateName(req, res, next) {
    const name = req.params.name;
    if (typeof name !== "string") {
        return res.status(400).json({ error: "Name should be a string" });
    }
    // If validation passes, continue to the next middleware or route handler
    next();
}

// Create a new person with a dynamic name parameter
app.post("/api/:name", validateName, async (req, res) => {
    try {
        const name = req.params.name;
        const person = new Person({ name, ...req.body });
        await person.save();
        res.json(person);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
});

// Get all persons
app.get("/api", async (req, res) => {
    try {
        const persons = await Person.find();
        res.json(persons);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
});

// Get a person by name
app.get("/api/:name", validateName, async (req, res) => {
    try {
        const name = req.params.name;
        const person = await Person.findOne({ name });
        if (!person) {
            return res.status(404).json({ error: "Person not found" });
        }
        res.json(person);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
});

// Update a person by name
app.put("/api/:name", validateName, async (req, res) => {
    try {
        const name = req.params.name;
        const updatedPerson = await Person.findOneAndUpdate(
            { name },
            req.body,
            { new: true }
        );
        if (!updatedPerson) {
            return res.status(404).json({ error: "Person not found" });
        }
        res.json(updatedPerson);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
});

// Delete a person by name
app.delete("/api/:name", validateName, async (req, res) => {
    try {
        const name = req.params.name;
        const deletedPerson = await Person.findOneAndDelete({ name });
        if (!deletedPerson) {
            return res.status(404).json({ error: "Person not found" });
        }
        res.json({ message: "Person deleted" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
