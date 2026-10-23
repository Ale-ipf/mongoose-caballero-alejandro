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
  addTaskTagValidation,
  createTaskValidation,
  idParamValidation,
  tagIdParamValidation,
  updateTaskValidation,
} from "../middlewares/validations/resource.validation.js";

export const taskRouter = Router();

taskRouter
  .route("/tasks")
  .get(getAllTasks)
  .post(createTaskValidation, validate, createTask);

taskRouter
  .route("/tasks/:id")
  .get(idParamValidation, validate, getTaskById)
  .patch(idParamValidation, updateTaskValidation, validate, updateTask)
  .delete(idParamValidation, validate, deleteTask);

taskRouter
  .route("/tasks/:id/tags")
  .post(idParamValidation, addTaskTagValidation, validate, addTagToTask);

taskRouter
  .route("/tasks/:id/tags/:tagId")
  .delete(idParamValidation, tagIdParamValidation, validate, removeTagFromTask);