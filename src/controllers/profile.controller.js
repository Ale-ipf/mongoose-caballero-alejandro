import { matchedData } from "express-validator";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";

const profilePopulation = { path: "user", match: { deletedAt: null } };

class ProfileControllerError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const ensureUserExists = async (userId) => {
  if (!(await User.exists({ _id: userId, deletedAt: null }))) {
    throw new ProfileControllerError(
      400,
      "Uno o más usuarios no existen o están eliminados.",
    );
  }
};

const notFound = (res) => res.status(404).json({ message: "Perfil no encontrado." });

const sendProfileError = (res, error, fallbackMessage) => {
  if (error instanceof ProfileControllerError) {
    return res.status(error.status).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "Ya existe un registro con esos datos." });
  }

  console.error(error);
  return res.status(500).json({ message: fallbackMessage });
};

export const createProfile = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    await ensureUserExists(data.user);

    const profile = new Profile(data);
    await profile.save();
    await profile.populate(profilePopulation);
    return res.status(201).json({ data: profile });
  } catch (error) {
    return sendProfileError(res, error, "No se pudo crear el perfil.");
  }
};

export const getAllProfiles = async (_req, res) => {
  try {
    const profiles = await Profile.find({ deletedAt: null })
      .populate(profilePopulation)
      .sort({ lastName: 1, firstName: 1 });
    return res.status(200).json({ data: profiles });
  } catch (error) {
    return sendProfileError(res, error, "No se pudieron obtener los perfiles.");
  }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      _id: req.params.id,
      deletedAt: null,
    }).populate(profilePopulation);
    if (!profile) return notFound(res);
    return res.status(200).json({ data: profile });
  } catch (error) {
    return sendProfileError(res, error, "No se pudo obtener el perfil.");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });
    if (data.user) await ensureUserExists(data.user);

    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: data },
      { new: true, runValidators: true },
    ).populate(profilePopulation);
    if (!profile) return notFound(res);
    return res.status(200).json({ data: profile });
  } catch (error) {
    return sendProfileError(res, error, "No se pudo actualizar el perfil.");
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true },
    );
    if (!profile) return notFound(res);
    return res.status(200).json({ message: "Perfil eliminado." });
  } catch (error) {
    return sendProfileError(res, error, "No se pudo eliminar el perfil.");
  }
};
