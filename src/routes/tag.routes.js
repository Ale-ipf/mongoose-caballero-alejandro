import { Router } from "express";
import {
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag,
} from "../controllers/tag.controller.js";
import {
  requireMatchedBody,
  validate,
} from "../middlewares/validator.middleware.js";
import {
  createTagValidation,
  idParamValidation,
  updateTagValidation,
} from "../middlewares/validations/tagValidation.js";

export const tagRouter = Router();

tagRouter
  .route("/tags")
  .get(getAllTags)
  .post(createTagValidation, validate, createTag);

tagRouter
  .route("/tags/:id")
  .get(idParamValidation, validate, getTagById)
  .patch(
    idParamValidation,
    updateTagValidation,
    validate,
    requireMatchedBody,
    updateTag,
  )
  .delete(idParamValidation, validate, deleteTag);