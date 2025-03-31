require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// 🔹 Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/todo", { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => console.log("✅ Connected to MongoDB (todo_database)"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 🔹 User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// 🔹 Task Schema (Linked to User)
const TaskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Associate task with a user
});
const Task = mongoose.model("Task", TaskSchema);

// 🔹 Middleware to Authenticate Token
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user;  // Attach user info to request
        next();
    });
}

// 🔹 Register User
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering user" });
    }
});

// 🔹 Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});

// 🔹 Get Only Logged-In User’s Tasks
app.get("/tasks", authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }); // Only get tasks for the logged-in user
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// 🔹 Add Task (Only for Logged-In User)
app.post("/tasks", authenticateToken, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Task text is required" });

    try {
        const newTask = new Task({ text, userId: req.user.id });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ message: "Error adding task" });
    }
});

// 🔹 Update Task
app.put("/tasks/:id", authenticateToken, async (req, res) => {
    const { text } = req.body;

    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.text = text;
        await task.save();
        res.json({ message: "Task updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating task" });
    }
});

// 🔹 Delete Task
app.delete("/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });

        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting task" });
    }
});

// 🔹 Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
