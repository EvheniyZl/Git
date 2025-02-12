import express from "express";
import {
  createSubTask,
  updateSubTask,
  deleteSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateTask,
  updateActivity, deleteActivity,
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddlewave.js";

const router = express.Router();

router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity);

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update-subtask/:id/:subTaskId", protectRoute, isAdminRoute, updateSubTask);
router.delete("/delete-subtask/:id/:subTaskId", protectRoute, isAdminRoute, deleteSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/:id", protectRoute, isAdminRoute, trashTask);
router.put("/update-activity/:taskId/:activityId", protectRoute, isAdminRoute, updateActivity);
router.delete("/delete-activity/:taskId/:activityId", protectRoute, isAdminRoute, deleteActivity);

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

export default router;
