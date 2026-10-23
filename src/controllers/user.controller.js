import { Role } from "../models/role.model.js";
import { Profile } from "../models/profile.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import {
  ensureDocumentsExist,
  notFound,
  pickFields,
  sendControllerError,
} from "./controller.utils.js";

const userFields = ["username", "email", "password", "addresses", "roles"];
const userPopulation = [
  { path: "roles", match: { deletedAt: null } },
  { path: "profile", match: { deletedAt: null } },
  {
    path: "tasks",
    match: { deletedAt: null },
    populate: { path: "tags", match: { deletedAt: null } },
  },
];

const withoutPassword = (user) => {
  const result = user.toObject();
  delete result.password;
  return result;
};

export const createUser = async (req, res) => {
  try {
    const data = pickFields(req.body, userFields);
    await ensureDocumentsExist(Role, data.roles ?? [], "roles");

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
    const data = pickFields(req.body, userFields);
    await ensureDocumentsExist(Role, data.roles ?? [], "roles");

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
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt } },
      { new: true },
    );
    if (!user) return notFound(res, "Usuario");

    await Promise.all([
      Task.updateMany(
        { author: user._id, deletedAt: null },
        { $set: { deletedAt } },
      ),
      Profile.updateOne(
        { user: user._id, deletedAt: null },
        { $set: { deletedAt } },
      ),
    ]);

    return res.status(200).json({ message: "Usuario y sus tareas y perfil eliminados." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo eliminar el usuario.");
  }
};
