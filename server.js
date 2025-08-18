// Import packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Declare variables
const server = express();
const port = 4000;
const databaseAddress = "mongodb://localhost:27017/task-manager";

// Middlewares
server.use(cors());
server.use(express.json());

// Database connection
mongoose
  .connect(databaseAddress)
  .then(() => console.log("Database connected successfully ✅"))
  .catch((error) => console.log("Error connecting to database ❌ " + error));

// Database schema and model
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },   // auto-set when task is created
  status: { type: Boolean, default: false }, // pending = false, done = true
});

const Task = mongoose.model("Task", taskSchema);



// Get all tasks
server.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: -1 }); 
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
server.post("/tasks", async (req, res) => {
  try {
    const { text, status } = req.body;
    const task = new Task({ text, status });
    const savedTask = await task.save();
    res.status(201).json(savedTask); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task (full replace)
server.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Partially update task (patch)
server.patch("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
server.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


server.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});
