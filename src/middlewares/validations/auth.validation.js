import { body } from "express-validator";
import { Role } from "../../models/role.model.js";
import { User } from "../../models/user.model.js";

const uniqueUserField = (field) =>
  body(field).optional().custom(async (value) => {
    if (await User.exists({ [field]: value })) {
      throw new Error(`El ${field} ya está registrado.`);
    }
  });

const optionalAddresses = body("addresses")
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
        typeof address.country === "string" &&
        address.country.trim().length > 0,
    ),
  )
  .withMessage("Cada dirección debe incluir city y country.");

const optionalRoles = [
  body("roles").optional().isArray().withMessage("roles debe ser un array."),
  body("roles.*")
    .optional()
    .isMongoId()
    .withMessage("Cada rol debe ser un ObjectId válido."),
  body("roles").optional().custom(async (roles) => {
    const count = await Role.countDocuments({
      _id: { $in: roles },
      deletedAt: null,
    });
    if (count !== roles.length) {
      throw new Error("Uno o más roles no existen o están eliminados.");
    }
  }),
];

export const registerValidation = [
  body("username")
    .isString()
    .withMessage("username debe ser texto.")
    .bail()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("username debe tener entre 3 y 30 caracteres."),
  uniqueUserField("username"),
  body("email").isString().withMessage("email debe ser texto.").bail().trim().isEmail().withMessage("email debe ser válido.").normalizeEmail(),
  uniqueUserField("email"),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("password debe tener entre 8 y 128 caracteres."),
  optionalAddresses,
  ...optionalRoles,
];

export const loginValidation = [
  body("email").isString().withMessage("email debe ser texto.").bail().trim().isEmail().withMessage("email debe ser válido.").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("password es obligatorio."),
];