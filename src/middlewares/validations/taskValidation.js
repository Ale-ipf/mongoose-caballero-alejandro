import { body, param } from "express-validator";
import { Tag } from "../../models/tag.model.js";
import { Task } from "../../models/task.model.js";
import { TaskTag } from "../../models/taskTag.model.js";
import { User } from "../../models/user.model.js";

export const taskIdValidation = param("id")
  .isMongoId()
  .withMessage("id debe ser un ObjectId válido.");

export const taskTagIdValidation = param("tagId")
  .isMongoId()
  .withMessage("tagId debe ser un ObjectId válido.");

const titleValidation = (required) => {
  const field = body("title");
  if (!required) field.optional();

  return field
    .isString()
    .withMessage("title debe ser texto.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("title debe tener entre 1 y 120 caracteres.");
};

const descriptionValidation = (required) => {
  const field = body("description");
  if (!required) field.optional();

  return field
    .isString()
    .withMessage("description debe ser texto.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("description debe tener entre 1 y 2000 caracteres.");
};

const authorValidation = (required) => {
  const field = body("author");
  if (!required) field.optional();

  return field
    .isMongoId()
    .withMessage("author debe ser un ObjectId válido.")
    .bail()
    .custom(async (authorId) => {
      if (!(await User.exists({ _id: authorId, deletedAt: null }))) {
        throw new Error("El autor no existe o está eliminado.");
      }
    });
};

export const createTaskValidation = [
  titleValidation(true),
  descriptionValidation(true),
  authorValidation(true),
];

export const updateTaskValidation = [
  titleValidation(false),
  descriptionValidation(false),
  authorValidation(false),
];

export const addTagToTaskValidation = [
  body("tagId")
    .isMongoId()
    .withMessage("tagId debe ser un ObjectId válido.")
    .bail()
    .custom(async (tagId, { req }) => {
      if (!(await Task.exists({ _id: req.params.id, deletedAt: null }))) {
        throw new Error("La tarea no existe o está eliminada.");
      }
      if (!(await Tag.exists({ _id: tagId, deletedAt: null }))) {
        throw new Error("La etiqueta no existe o está eliminada.");
      }
      if (await TaskTag.exists({ task: req.params.id, tag: tagId, deletedAt: null })) {
        throw new Error("La etiqueta ya está asociada a la tarea.");
      }
    }),
];

export const removeTagFromTaskValidation = [
  taskIdValidation,
  taskTagIdValidation,
];