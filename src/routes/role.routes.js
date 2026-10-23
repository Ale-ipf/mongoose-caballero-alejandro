import { Router } from "express";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
} from "../controllers/role.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createRoleValidation,
  idParamValidation,
  updateRoleValidation,
} from "../middlewares/validations/resource.validation.js";

export const roleRouter = Router();

roleRouter
  .route("/roles")
  .get(getAllRoles)
  .post(createRoleValidation, validate, createRole);

roleRouter
  .route("/roles/:id")
  .get(idParamValidation, validate, getRoleById)
  .patch(idParamValidation, updateRoleValidation, validate, updateRole)
  .delete(idParamValidation, validate, deleteRole);