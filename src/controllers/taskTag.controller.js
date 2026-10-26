import { matchedData } from "express-validator";
import { TaskTag } from "../models/taskTag.model.js";

const taskTagPopulation = [
  { path: "task", match: { deletedAt: null } },
  { path: "tag", match: { deletedAt: null } },
];

const notFound = (res) =>
  res.status(404).json({ message: "No se encontró el vínculo tarea-etiqueta." });

const sendTaskTagError = (res, error, message) => {
  if (error?.code === 11000) {
    return res.status(409).json({ message: "La etiqueta ya está asociada a la tarea." });
  }
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(message, error);
  return res.status(500).json({ message });
};

export const createTaskTag = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    const taskTag = new TaskTag(data);
    await taskTag.save();
    await taskTag.populate(taskTagPopulation);
    return res.status(201).json({ data: taskTag });
  } catch (error) {
    return sendTaskTagError(res, error, "No se pudo crear el vínculo tarea-etiqueta.");
  }
};

export const getAllTaskTags = async (_req, res) => {
  try {
    const taskTags = await TaskTag.find({ deletedAt: null })
      .populate(taskTagPopulation)
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: taskTags });
  } catch (error) {
    return sendTaskTagError(res, error, "No se pudieron obtener los vínculos tarea-etiqueta.");
  }
};

export const getTaskTagById = async (req, res) => {
  try {
    const taskTag = await TaskTag.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate(taskTagPopulation);
    if (!taskTag) return notFound(res);
    return res.status(200).json({ data: taskTag });
  } catch (error) {
    return sendTaskTagError(res, error, "No se pudo obtener el vínculo tarea-etiqueta.");
  }
};

export const updateTaskTag = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    const taskTag = await TaskTag.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    ).populate(taskTagPopulation);
    if (!taskTag) return notFound(res);
    return res.status(200).json({ data: taskTag });
  } catch (error) {
    return sendTaskTagError(res, error, "No se pudo actualizar el vínculo tarea-etiqueta.");
  }
};

export const deleteTaskTag = async (req, res) => {
  try {
    const taskTag = await TaskTag.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!taskTag) return notFound(res);
    return res.status(200).json({ message: "Vínculo tarea-etiqueta eliminado." });
  } catch (error) {
    return sendTaskTagError(res, error, "No se pudo eliminar el vínculo tarea-etiqueta.");
  }
};
