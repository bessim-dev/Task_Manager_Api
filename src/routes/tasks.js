const { Router } = require("express");
const Task = require("../db/models/task");
const auth = require("../middleware/auth");

const router = new Router();

router.post("/tasks", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user._id });
    task.save();
    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/tasks", auth, async (req, res) => {
  try {
    await req.user.populate("tasks").execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("there is no such a task");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isAllowed = updates.every((update) => {
    if (!allowedUpdates.includes(update)) {
      return false;
    }
    return true;
  });
  if (!isAllowed) {
    return res.status(400).send("update is not allowed");
  }
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("there is no such a task");
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("there is no such a task");
    }
    res.send(task.description + " is deleted");
  } catch (error) {
    res.status(500).send(e.message);
  }
});
module.exports = router;
