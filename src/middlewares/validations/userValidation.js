import { body, param } from "express-validator";
import { User } from "../../models/user.model.js";

export const idParamValidation = param("id")
  .isMongoId()
  .withMessage("id debe ser un ObjectId válido.");

const usernameValidation = (required) => {
  const field = body("username");
  if (!required) field.optional();

  return field
    .isString()
    .withMessage("username debe ser texto.")
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("username debe tener entre 3 y 30 caracteres.")
    .bail()
    .custom(async (username, { req }) => {
      const existing = await User.exists({
        username,
        deletedAt: null,
        ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
      });
      if (existing) throw new Error("El username ya está en uso.");
    });
};

const emailValidation = (required) => {
  const field = body("email");
  if (!required) field.optional();

  return field
    .isString()
    .withMessage("email debe ser texto.")
    .bail()
    .trim()
    .isEmail()
    .withMessage("email debe ser válido.")
    .normalizeEmail()
    .bail()
    .custom(async (email, { req }) => {
      const existing = await User.exists({
        email,
        deletedAt: null,
        ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
      });
      if (existing) throw new Error("El email ya está en uso.");
    });
};

const passwordValidation = (required) => {
  const field = body("password");
  if (!required) field.optional();

  return field
    .isString()
    .withMessage("password debe ser texto.")
    .bail()
    .isLength({ min: 8, max: 100 })
    .withMessage("password debe tener entre 8 y 100 caracteres.");
};

const addressesValidation = body("addresses")
  .optional()
  .isArray()
  .withMessage("addresses debe ser un array.")
  .bail()
  .custom((addresses) =>
    addresses.every(
      (address) =>
        address &&
        typeof address.city === "string" &&
        address.city.trim().length > 0 &&
        address.city.trim().length <= 100 &&
        typeof address.country === "string" &&
        address.country.trim().length > 0 &&
        address.country.trim().length <= 100,
    ),
  )
  .withMessage("Cada dirección debe incluir city y country válidos (1-100 caracteres).");

const rolesValidation = body("roles")
  .optional()
  .isArray()
  .withMessage("roles debe ser un array.")
  .bail()
  .custom((roles) => {
    if (roles.some((roleId) => typeof roleId !== "string" || !/^[a-f\d]{24}$/i.test(roleId))) {
      throw new Error("Cada role debe ser un ObjectId válido.");
    }
    if (new Set(roles.map((roleId) => roleId.toLowerCase())).size !== roles.length) {
      throw new Error("No se pueden repetir roles.");
    }
    return true;
  });

export const createUserValidation = [
  usernameValidation(true),
  emailValidation(true),
  passwordValidation(true),
  addressesValidation,
  rolesValidation,
];

export const updateUserValidation = [
  usernameValidation(false),
  emailValidation(false),
  passwordValidation(false),
  addressesValidation,
  rolesValidation,
];