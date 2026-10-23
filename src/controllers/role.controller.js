import { Role } from "../models/role.model.js";
import { User } from "../models/user.model.js";
import {
  notFound,
  pickFields,
  sendControllerError,
} from "./controller.utils.js";

export const createRole = async (req, res) => {
  try {
    const role = new Role(pickFields(req.body, ["rolename"]));
    await role.save();
    return res.status(201).json({ data: role });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo crear el rol.");
  }
};

export const getAllRoles = async (_req, res) => {
  try {
    const roles = await Role.find({ deletedAt: null }).sort({ rolename: 1 });
    return res.status(200).json({ data: roles });
  } catch (error) {
    return sendControllerError(res, error, "No se pudieron obtener los roles.");
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, deletedAt: null });
    if (!role) return notFound(res, "Rol");
    return res.status(200).json({ data: role });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo obtener el rol.");
  }
};

export const updateRole = async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: pickFields(req.body, ["rolename"]) },
      { new: true, runValidators: true },
    );
    if (!role) return notFound(res, "Rol");
    return res.status(200).json({ data: role });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo actualizar el rol.");
  }
};

export const deleteRole = async (req, res) => {
  try {
    const deletedAt = new Date();
    const role = await Role.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt } },
      { new: true },
    );
    if (!role) return notFound(res, "Rol");

    await User.updateMany(
      { roles: role._id },
      { $pull: { roles: role._id } },
    );

    return res.status(200).json({ message: "Rol eliminado y desvinculado de los usuarios." });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo eliminar el rol.");
  }
};