import { Router } from "express";
import {
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag,
} from "../controllers/tag.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createTagValidation,
  idParamValidation,
  updateTagValidation,
} from "../middlewares/validations/resource.validation.js";

export const tagRouter = Router();

tagRouter
  .route("/tags")
  .get(getAllTags)
  .post(createTagValidation, validate, createTag);

tagRouter
  .route("/tags/:id")
  .get(idParamValidation, validate, getTagById)
  .patch(idParamValidation, updateTagValidation, validate, updateTag)
  .delete(idParamValidation, validate, deleteTag);