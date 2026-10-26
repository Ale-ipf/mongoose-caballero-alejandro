import { Router } from "express";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import {
  requireMatchedBody,
  validate,
} from "../middlewares/validator.middleware.js";
import {
  createUserValidation,
  idParamValidation,
  updateUserValidation,
} from "../middlewares/validations/userValidation.js";

export const userRouter = Router();

userRouter
  .route("/users")
  .get(getAllUsers)
  .post(createUserValidation, validate, createUser);

userRouter
  .route("/users/:id")
  .get(idParamValidation, validate, getUserById)
  .patch(
    idParamValidation,
    updateUserValidation,
    validate,
    requireMatchedBody,
    updateUser,
  )
  .delete(idParamValidation, validate, deleteUser);