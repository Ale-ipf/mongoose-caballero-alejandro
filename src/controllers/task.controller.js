import { Tag } from "../models/tag.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import {
  ensureDocumentsExist,
  notFound,
  pickFields,
  sendControllerError,
} from "./controller.utils.js";

const taskFields = ["title", "description", "author", "tags"];
const taskPopulation = [
  { path: "author", match: { deletedAt: null } },
  { path: "tags", match: { deletedAt: null } },
];

const checkTaskReferences = async (data) => {
  if (data.author) await ensureDocumentsExist(User, [data.author], "autores");
  if (data.tags) await ensureDocumentsExist(Tag, data.tags, "etiquetas");
};

export const createTask = async (req, res) => {
  try {
    const data = pickFields(req.body, taskFields);
    await checkTaskReferences(data);

    const task = new Task(data);
    await task.save();
    await task.populate(taskPopulation);
    return res.status(201).json({ data: task });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo crear la tarea.");
  }
};

export const getAllTasks = async (_req, res) => {
  try {
    const tasks = await Task.find({ deletedAt: null })
      .populate(taskPopulation)
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: tasks });
  } catch (error) {
    return sendControllerError(res, error, "No se pudieron obtener las tareas.");
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, deletedAt: null }).populate(
      taskPopulation,
    );
    if (!task) return notFound(res, "Tarea");
    return res.status(200).json({ data: task });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo obtener la tarea.");
  }
};

export const updateTask = async (req, res) => {
  try {
    const data = pickFields(req.body, taskFields);
    await checkTaskReferences(data);

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    ).populate(taskPopulation);
    if (!task) return notFound(res, "Tarea");
    return res.status(200).json({ data: task });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo actualizar la tarea.");
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!task) return notFound(res, "Tarea");
    return res.status(200).json({ message: "Tarea eliminada." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo eliminar la tarea.");
  }
};

export const addTagToTask = async (req, res) => {
  try {
    const { tagId } = req.body;
    await ensureDocumentsExist(Tag, [tagId], "etiquetas");

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null, tags: { $ne: tagId } },
      { $addToSet: { tags: tagId } },
      { new: true, runValidators: true },
    ).populate(taskPopulation);

    if (!task) {
      const existingTask = await Task.exists({ _id: req.params.id, deletedAt: null });
      if (!existingTask) return notFound(res, "Tarea");
      return res.status(409).json({ message: "La etiqueta ya está asociada a la tarea." });
    }

    return res.status(200).json({ data: task, message: "Etiqueta asociada a la tarea." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo asociar la etiqueta a la tarea.");
  }
};

export const removeTagFromTask = async (req, res) => {
  try {
    const { tagId } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null, tags: tagId },
      { $pull: { tags: tagId } },
      { new: true, runValidators: true },
    ).populate(taskPopulation);
    if (!task) return notFound(res, "Tarea o vínculo con etiqueta");
    return res.status(200).json({ data: task, message: "Etiqueta quitada de la tarea." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo quitar la etiqueta de la tarea.");
  }
};