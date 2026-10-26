import { Router } from "express";
import {
  createTaskTag,
  deleteTaskTag,
  getAllTaskTags,
  getTaskTagById,
  updateTaskTag,
} from "../controllers/taskTag.controller.js";
import { requireMatchedBody, validate } from "../middlewares/validator.middleware.js";
import {
  createTaskTagValidation,
  taskTagIdValidation,
  updateTaskTagValidation,
} from "../middlewares/validations/taskTagValidation.js";

export const taskTagRouter = Router();

taskTagRouter
  .route("/task-tags")
  .get(getAllTaskTags)
  .post(createTaskTagValidation, validate, createTaskTag);

taskTagRouter
  .route("/task-tags/:id")
  .get(taskTagIdValidation, validate, getTaskTagById)
  .patch(
    taskTagIdValidation,
    updateTaskTagValidation,
    validate,
    requireMatchedBody,
    updateTaskTag,
  )
  .delete(taskTagIdValidation, validate, deleteTaskTag);