import { matchedData } from "express-validator";
import { Tag } from "../models/tag.model.js";
import { TaskTag } from "../models/taskTag.model.js";

export const createTag = async (req, res) => {
  try {
    const tag = new Tag(matchedData(req, { locations: ["body"] }));
    await tag.save();
    return res.status(201).json({ data: tag });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo crear la etiqueta.");
  }
};

export const getAllTags = async (_req, res) => {
  try {
    const tags = await Tag.find({ deletedAt: null }).sort({ name: 1 });
    return res.status(200).json({ data: tags });
  } catch (error) {
    return sendControllerError(res, error, "No se pudieron obtener las etiquetas.");
  }
};

export const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findOne({ _id: req.params.id, deletedAt: null }).populate({
      path: "taskTags",
      match: { deletedAt: null },
      populate: {
        path: "task",
        match: { deletedAt: null },
        populate: { path: "author", match: { deletedAt: null } },
      },
    });
    if (!tag) return notFound(res, "Etiqueta");
    return res.status(200).json({ data: tag });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo obtener la etiqueta.");
  }
};

export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: matchedData(req, { locations: ["body"] }) },
      { new: true, runValidators: true },
    );
    if (!tag) return notFound(res, "Etiqueta");
    return res.status(200).json({ data: tag });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo actualizar la etiqueta.");
  }
};

export const deleteTag = async (req, res) => {
  try {
    const deletedAt = new Date();
    const tag = await runTransaction(async (session) => {
      const deletedTag = await Tag.findOneAndUpdate(
        { _id: req.params.id, deletedAt: null },
        { $set: { deletedAt } },
        { new: true, session },
      );
      if (!deletedTag) return null;

      await TaskTag.updateMany(
        { tag: deletedTag._id, deletedAt: null },
        { $set: { deletedAt } },
        { session },
      );
      return deletedTag;
    });

    if (!tag) return notFound(res, "Etiqueta");

    return res.status(200).json({ message: "Etiqueta eliminada y desvinculada de las tareas." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo eliminar la etiqueta.");
  }
};