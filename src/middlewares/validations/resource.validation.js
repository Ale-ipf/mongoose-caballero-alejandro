import { body, param } from "express-validator";
import { Profile } from "../../models/profile.model.js";
import { Role } from "../../models/role.model.js";
import { Tag } from "../../models/tag.model.js";
import { User } from "../../models/user.model.js";

export const idParamValidation = param("id")
  .isMongoId()
  .withMessage("id debe ser un ObjectId válido.");

const stringField = (field, { required = false, min = 1, max }) => {
  const chain = body(field);
  if (!required) chain.optional();

  return chain
    .isString()
    .withMessage(`${field} debe ser texto.`)
    .bail()
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} debe tener entre ${min} y ${max} caracteres.`);
};

const emailField = (required = false) => {
  const chain = body("email");
  if (!required) chain.optional();

  return chain
    .isString()
    .withMessage("email debe ser texto.")
    .bail()
    .trim()
    .isEmail()
    .withMessage("email debe ser válido.")
    .normalizeEmail();
};

const uniqueValue = (Model, field, label) =>
  body(field)
    .optional()
    .custom(async (value, { req }) => {
      const query = { [field]: value };
      if (!Model.schema.path(field).options.unique) query.deletedAt = null;
      if (req.params.id) query._id = { $ne: req.params.id };
      if (await Model.exists(query)) throw new Error(`${label} ya está en uso.`);
    });

const optionalAddresses = [
  body("addresses")
    .optional()
    .isArray()
    .withMessage("addresses debe ser un array."),
  body("addresses.*.city")
    .isString()
    .withMessage("Cada city debe ser texto.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Cada dirección debe incluir city."),
  body("addresses.*.country")
    .isString()
    .withMessage("Cada country debe ser texto.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Cada dirección debe incluir country."),
];

const rolesValidation = [
  body("roles").optional().isArray().withMessage("roles debe ser un array."),
  body("roles.*")
    .optional()
    .isMongoId()
    .withMessage("Cada rol debe ser un ObjectId válido."),
  body("roles")
    .optional()
    .custom(async (roles) => {
      if (new Set(roles.map(String)).size !== roles.length) {
        throw new Error("No se pueden repetir roles.");
      }
      const count = await Role.countDocuments({
        _id: { $in: roles },
        deletedAt: null,
      });
      if (count !== roles.length) {
        throw new Error("Uno o más roles no existen o están eliminados.");
      }
    }),
];

export const createUserValidation = [
  stringField("username", { required: true, min: 3, max: 30 }),
  uniqueValue(User, "username", "username"),
  emailField(true),
  uniqueValue(User, "email", "email"),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("password debe tener entre 8 y 128 caracteres."),
  ...optionalAddresses,
  ...rolesValidation,
];

export const updateUserValidation = [
  stringField("username", { min: 3, max: 30 }),
  uniqueValue(User, "username", "username"),
  emailField(),
  uniqueValue(User, "email", "email"),
  body("password")
    .optional()
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("password debe tener entre 8 y 128 caracteres."),
  ...optionalAddresses,
  ...rolesValidation,
];

const activeReference = (Model, field, label, required) => {
  const chain = body(field);
  if (!required) chain.optional();

  return chain
    .isMongoId()
    .withMessage(`${field} debe ser un ObjectId válido.`)
    .bail()
    .custom(async (id) => {
      if (!(await Model.exists({ _id: id, deletedAt: null }))) {
        throw new Error(`${label} no existe o está eliminado.`);
      }
    });
};

const taskFields = (required) => [
  stringField("title", { required, min: 1, max: 120 }),
  stringField("description", { required, min: 1, max: 2000 }),
  activeReference(User, "author", "El autor", required),
  body("tags")
    .optional()
    .isArray()
    .withMessage("tags debe ser un array.")
    .bail()
    .custom(async (ids) => {
      if (ids.some((id) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))) {
        throw new Error("Cada etiqueta debe ser un ObjectId válido.");
      }
      if (new Set(ids.map((id) => id.toLowerCase())).size !== ids.length) {
        throw new Error("No se pueden repetir etiquetas.");
      }
      const count = await Tag.countDocuments({
        _id: { $in: ids },
        deletedAt: null,
      });
      if (count !== ids.length) {
        throw new Error("Una o más etiquetas no existen o están eliminadas.");
      }
    }),
];

export const createTaskValidation = taskFields(true);
export const updateTaskValidation = taskFields(false);

export const createRoleValidation = [
  stringField("rolename", { required: true, min: 2, max: 50 }),
  uniqueValue(Role, "rolename", "rolename"),
];
export const updateRoleValidation = [
  stringField("rolename", { min: 2, max: 50 }),
  uniqueValue(Role, "rolename", "rolename"),
];

export const createTagValidation = [
  stringField("name", { required: true, min: 2, max: 50 }),
  uniqueValue(Tag, "name", "name"),
];
export const updateTagValidation = [
  stringField("name", { min: 2, max: 50 }),
  uniqueValue(Tag, "name", "name"),
];

const profileFields = (required) => [
  stringField("firstName", { required, min: 1, max: 80 }),
  stringField("lastName", { required, min: 1, max: 80 }),
  body("bio")
    .optional()
    .isString()
    .withMessage("bio debe ser texto.")
    .bail()
    .trim()
    .isLength({ max: 500 })
    .withMessage("bio no puede superar 500 caracteres."),
  body("user")
    [required ? "exists" : "optional"]()
    .isMongoId()
    .withMessage("user debe ser un ObjectId válido.")
    .bail()
    .custom(async (userId, { req }) => {
      if (
        await Profile.exists({
          user: userId,
          deletedAt: null,
          ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
        })
      ) {
        throw new Error("El usuario ya tiene un perfil activo.");
      }
      if (!(await User.exists({ _id: userId, deletedAt: null }))) {
        throw new Error("El usuario no existe o está eliminado.");
      }
    }),
];

export const createProfileValidation = profileFields(true);
export const updateProfileValidation = profileFields(false);
