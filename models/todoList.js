const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ToDoListSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Incomplete",
  },
  createdOn: {
    type: Date,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  subTasks: [
    {
      description: String,
      assignedTo: String,
      priority: { type: Boolean, default: false },
      status: { type: String, default: "In Progress" },
    },
  ],
  sharedWith: [
    {
      userId: {
        type: String,
        required: true,
      },
      userEmail: {
        type: String,
      },
    },
  ],
  category: {
    type: String,
    default: "Interface", //will be of 2 types, Interface and Archived
    required: true,
  },
});

module.exports = mongoose.model("Todo", ToDoListSchema);
