import { body, param } from "express-validator";
import { Profile } from "../../models/profile.model.js";
import { User } from "../../models/user.model.js";

export const idParamValidation = param("id")
  .isMongoId()
  .withMessage("id debe ser un ObjectId válido.");

const textValidation = (fieldName, required, maxLength) => {
  const field = body(fieldName);
  if (!required) field.optional();

  return field
    .isString()
    .withMessage(`${fieldName} debe ser texto.`)
    .bail()
    .trim()
    .isLength({ min: fieldName === "bio" ? 0 : 1, max: maxLength })
    .withMessage(`${fieldName} no debe superar ${maxLength} caracteres.`);
};

const userValidation = (required) => {
  const field = body("user");
  if (!required) field.optional();

  return field
    .isMongoId()
    .withMessage("user debe ser un ObjectId válido.")
    .bail()
    .custom(async (userId, { req }) => {
      if (!(await User.exists({ _id: userId, deletedAt: null }))) {
        throw new Error("El usuario no existe o está eliminado.");
      }
      const profileQuery = {
        user: userId,
        deletedAt: null,
        ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
      };
      if (await Profile.exists(profileQuery)) {
        throw new Error("El usuario ya tiene un perfil activo.");
      }
    });
};

export const createProfileValidation = [
  textValidation("firstName", true, 80),
  textValidation("lastName", true, 80),
  textValidation("bio", false, 1000),
  userValidation(true),
];

export const updateProfileValidation = [
  textValidation("firstName", false, 80),
  textValidation("lastName", false, 80),
  textValidation("bio", false, 1000),
  userValidation(false),
];