import mongoose, { Schema } from "mongoose";
import moment from 'moment-timezone';

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { 
      type: Date, 
      default: () => moment().tz("Europe/Kiev").toDate()
    },
    priority: {
      type: String,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "updated",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
            "subtask added",
            "subtask updated",
          ],
        },
        activity: String,
        date: { 
          type: Date, 
          default: () => moment().tz("Europe/Kiev").toDate()
        },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    subTasks: [
      {
        title: String,
        date: { type: Date, default: () => moment().tz("Europe/Kiev").toDate() },
        team: [{ type: Schema.Types.ObjectId, ref: "User" }],
        tag: String,
        stage: {
          type: String,
          default: "todo", // Default stage for subtasks
          enum: ["todo", "in progress", "completed"], // Valid stages for subtasks
        },
      },
    ],
    assets: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
