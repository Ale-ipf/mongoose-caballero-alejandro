import { matchedData } from "express-validator";
import { Task } from "../models/task.model.js";
import { TaskTag } from "../models/taskTag.model.js";
import { User } from "../models/user.model.js";

const taskPopulation = [
  { path: "author", match: { deletedAt: null } },
  {
    path: "taskTags",
    match: { deletedAt: null },
    populate: { path: "tag", match: { deletedAt: null } },
  },
];

const checkTaskReferences = async (data) => {
  if (data.author) await ensureDocumentsExist(User, [data.author], "autores");
};

export const createTask = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
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
    const data = matchedData(req, { locations: ["body"] });
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
    const deletedAt = new Date();
    const task = await runTransaction(async (session) => {
      const deletedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, deletedAt: null },
        { $set: { deletedAt } },
        { new: true, session },
      );
      if (!deletedTask) return null;

      await TaskTag.updateMany(
        { task: deletedTask._id, deletedAt: null },
        { $set: { deletedAt } },
        { session },
      );
      return deletedTask;
    });
    if (!task) return notFound(res, "Tarea");
    return res.status(200).json({ message: "Tarea eliminada." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo eliminar la tarea.");
  }
};

export const addTagToTask = async (req, res) => {
  try {
    const { tagId } = matchedData(req, { locations: ["body"] });
    const task = await Task.findOne({ _id: req.params.id, deletedAt: null });
    if (!task) return notFound(res, "Tarea");

    const taskTag = new TaskTag({ task: task._id, tag: tagId });
    await taskTag.save();
    await task.populate(taskPopulation);
    return res.status(200).json({ data: task, message: "Etiqueta asociada a la tarea." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo asociar la etiqueta a la tarea.");
  }
};

export const removeTagFromTask = async (req, res) => {
  try {
    const tagId = req.params.tagId ?? req.body.tagId;
    const task = await Task.findOne({ _id: req.params.id, deletedAt: null });
    if (!task) return notFound(res, "Tarea");

    const taskTag = await TaskTag.findOneAndUpdate(
      { task: task._id, tag: tagId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!taskTag) return notFound(res, "Vínculo con etiqueta");

    await task.populate(taskPopulation);
    return res.status(200).json({ data: task, message: "Etiqueta quitada de la tarea." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo quitar la etiqueta de la tarea.");
  }
};