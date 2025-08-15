//Import packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { type } = require("os");
const { error } = require("console");

//Declare variables
const server = express();
const port = 3000;
const databaseAddress = "mongodb://localhost:27017/task-manager";

//Middlewares
server.use(cors());
server.use(express.json());

//Database connection
mongoose
  .connect(databaseAddress)
  .then(() => console.log("Database connected successfully ✅"))
  .catch((error) => console.log("Error connecting to database ❌" + error));

//Database schema and model
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true },
});

const Task = mongoose.model("Task", taskSchema);

//CRUD operations (requests)
//Get tasks (Get request)
server.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task (Post request)

server.post("/tasks", async (req, res) => {
  try {
    const { text, date, status } = req.body;
    const task = new Task({ text, date, status });
    const savedTask = await task.save();
    res.status(201).json({ message: "Task created successfully", savedTask });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//update task (put request)
server.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTask) {
      res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//partially update task (patch request)
server.patch("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      res.status(404).json({ error: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// delete task (delete request)
server.delete("/tasks/:id" , async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      res.status(404).json({error : "Task not found"});
      res.json(deletedTask)
    }
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

//Server function
server.listen(port, () => {
  console.log("server running at http://localhost:" + port);
});
