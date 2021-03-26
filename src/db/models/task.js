const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema({
  description: {
    type: "string",
    trim: true,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});
const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;
