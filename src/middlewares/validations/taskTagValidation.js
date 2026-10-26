import { body, param } from "express-validator";
import { Tag } from "../../models/tag.model.js";
import { Task } from "../../models/task.model.js";
import { TaskTag } from "../../models/taskTag.model.js";

const isObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

export const taskTagIdValidation = param("id")
  .isMongoId()
  .withMessage("id debe ser un ObjectId válido.");

const taskReferenceValidation = (required) => {
  const field = body("task");
  if (!required) field.optional();

  return field
    .isMongoId()
    .withMessage("task debe ser un ObjectId válido.")
    .bail()
    .custom(async (taskId) => {
      if (!(await Task.exists({ _id: taskId, deletedAt: null }))) {
        throw new Error("La tarea no existe o está eliminada.");
      }
    })
    .bail()
    .custom(async (taskId, { req }) => {
      const current = required
        ? null
        : await TaskTag.findOne({ _id: req.params.id, deletedAt: null }).lean();
      const tagId = req.body.tag ?? current?.tag;
      if (
        isObjectId(tagId) &&
        (await TaskTag.exists({
          task: taskId,
          tag: tagId,
          deletedAt: null,
          ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
        }))
      ) {
        throw new Error("La etiqueta ya está asociada a la tarea.");
      }
    });
};

const tagReferenceValidation = (required) => {
  const field = body("tag");
  if (!required) field.optional();

  return field
    .isMongoId()
    .withMessage("tag debe ser un ObjectId válido.")
    .bail()
    .custom(async (tagId) => {
      if (!(await Tag.exists({ _id: tagId, deletedAt: null }))) {
        throw new Error("La etiqueta no existe o está eliminada.");
      }
    })
    .bail()
    .custom(async (tagId, { req }) => {
      const current = required
        ? null
        : await TaskTag.findOne({ _id: req.params.id, deletedAt: null }).lean();
      const taskId = req.body.task ?? current?.task;
      if (
        isObjectId(taskId) &&
        (await TaskTag.exists({
          task: taskId,
          tag: tagId,
          deletedAt: null,
          ...(req.params.id ? { _id: { $ne: req.params.id } } : {}),
        }))
      ) {
        throw new Error("La etiqueta ya está asociada a la tarea.");
      }
    });
};

export const createTaskTagValidation = [
  taskReferenceValidation(true),
  tagReferenceValidation(true),
];

export const updateTaskTagValidation = [
  taskReferenceValidation(false),
  tagReferenceValidation(false),
];