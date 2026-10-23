import { Router } from "express";
import {
  addTagToTask,
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  removeTagFromTask,
  updateTask,
} from "../controllers/task.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  addTagToTaskValidation,
  createTaskValidation,
  removeTagFromTaskValidation,
  taskIdValidation,
  updateTaskValidation,
} from "../middlewares/validations/task.validation.js";

export const taskRouter = Router();

taskRouter
  .route("/tasks")
  .get(getAllTasks)
  .post(createTaskValidation, validate, createTask);

taskRouter
  .route("/tasks/:id")
  .get(taskIdValidation, validate, getTaskById)
  .patch(taskIdValidation, updateTaskValidation, validate, updateTask)
  .delete(taskIdValidation, validate, deleteTask);

taskRouter
  .route("/tasks/:id/tags")
  .post(taskIdValidation, addTagToTaskValidation, validate, addTagToTask);

taskRouter
  .route("/tasks/:id/tags/:tagId")
  .delete(removeTagFromTaskValidation, validate, removeTagFromTask);