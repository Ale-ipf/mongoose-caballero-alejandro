import { matchedData } from "express-validator";
import { Profile } from "../models/profile.model.js";
import { Task } from "../models/task.model.js";
import { TaskTag } from "../models/taskTag.model.js";
import { User } from "../models/user.model.js";

const userPopulation = [
  { path: "roles", match: { deletedAt: null } },
  { path: "profile", match: { deletedAt: null } },
  {
    path: "tasks",
    match: { deletedAt: null },
    populate: {
      path: "taskTags",
      match: { deletedAt: null },
      populate: { path: "tag", match: { deletedAt: null } },
    },
  },
];

const withoutPassword = (user) => {
  const result = user.toObject();
  delete result.password;
  return result;
};

export const createUser = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    await ensureDocumentsExist(Role, data.roles ?? [], "roles");
    data.password = await hashPassword(data.password);

    const user = new User(data);
    await user.save();
    return res.status(201).json({ data: withoutPassword(user) });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo crear el usuario.");
  }
};

export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find({ deletedAt: null })
      .populate(userPopulation)
      .sort({ username: 1 });
    return res.status(200).json({ data: users.map(withoutPassword) });
  } catch (error) {
    return sendControllerError(res, error, "No se pudieron obtener los usuarios.");
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null }).populate(
      userPopulation,
    );
    if (!user) return notFound(res, "Usuario");
    return res.status(200).json({ data: withoutPassword(user) });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo obtener el usuario.");
  }
};

export const updateUser = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    await ensureDocumentsExist(Role, data.roles ?? [], "roles");
    if (data.password) data.password = await hashPassword(data.password);

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    ).populate(userPopulation);
    if (!user) return notFound(res, "Usuario");
    return res.status(200).json({ data: withoutPassword(user) });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo actualizar el usuario.");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedAt = new Date();
    const user = await runTransaction(async (session) => {
      const deletedUser = await User.findOneAndUpdate(
        { _id: req.params.id, deletedAt: null },
        { $set: { deletedAt } },
        { new: true, session },
      );
      if (!deletedUser) return null;

      const taskIds = await Task.find({
        author: deletedUser._id,
        deletedAt: null,
      })
        .distinct("_id")
        .session(session);
      await Task.updateMany(
        { author: deletedUser._id, deletedAt: null },
        { $set: { deletedAt } },
        { session },
      );
      await TaskTag.updateMany(
        { task: { $in: taskIds }, deletedAt: null },
        { $set: { deletedAt } },
        { session },
      );
      await Profile.updateOne(
        { user: deletedUser._id, deletedAt: null },
        { $set: { deletedAt } },
        { session },
      );
      return deletedUser;
    });

    if (!user) return notFound(res, "Usuario");

    return res.status(200).json({ message: "Usuario y sus tareas y perfil eliminados." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo eliminar el usuario.");
  }
};
