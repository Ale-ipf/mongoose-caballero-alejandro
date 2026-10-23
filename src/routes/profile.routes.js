import { Router } from "express";
import {
  createProfile,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
} from "../controllers/profile.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createProfileValidation,
  idParamValidation,
  updateProfileValidation,
} from "../middlewares/validations/resource.validation.js";

export const profileRouter = Router();

profileRouter
  .route("/profiles")
  .get(getAllProfiles)
  .post(createProfileValidation, validate, createProfile);

profileRouter
  .route("/profiles/:id")
  .get(idParamValidation, validate, getProfileById)
  .patch(idParamValidation, updateProfileValidation, validate, updateProfile)
  .delete(idParamValidation, validate, deleteProfile);
