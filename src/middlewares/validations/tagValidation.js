import { body, param } from "express-validator";
import { Tag } from "../../models/tag.model.js";

export const idParamValidation = param("id")
  .isMongoId()
  .withMessage("id debe ser un ObjectId válido.");

const nameValidation = (required) => {
  const field = body("name");
  if (!required) field.optional();

  return field
    .isString()
    .withMessage("name debe ser texto.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("name debe tener entre 1 y 80 caracteres.")
    .bail()
    .custom(async (name, { req }) => {
      const existing = await Tag.exists({
        name,
        deletedAt: null,
        ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
      });
      if (existing) throw new Error("Ya existe una etiqueta activa con ese nombre.");
    });
};

export const createTagValidation = [nameValidation(true)];
export const updateTagValidation = [nameValidation(false)];