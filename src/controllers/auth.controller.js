import { matchedData } from "express-validator";
import { User } from "../models/user.model.js";
import { sendControllerError } from "./controller.utils.js";
import { hashPassword, passwordMatches } from "../utils/password.js";

const publicUser = (user) => {
  const result = user.toObject();
  delete result.password;
  return result;
};

export const register = async (req, res) => {
  try {
    const { username, email, password, addresses, roles } = matchedData(req, {
      locations: ["body"],
    });
    const passwordHash = await hashPassword(password);
    const user = new User({
      username,
      email,
      password: passwordHash,
      addresses,
      roles,
    });

    await user.save();
    return res.status(201).json({
      message: "Usuario registrado correctamente.",
      data: publicUser(user),
    });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo registrar el usuario.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = matchedData(req, { locations: ["body"] });
    const user = await User.findOne({ email, deletedAt: null }).select("+password");

    if (!user || !(await passwordMatches(password, user.password))) {
      return res.status(401).json({ message: "Email o contraseña incorrectos." });
    }

    return res.status(200).json({
      message: "Credenciales correctas. Este endpoint no crea una sesión persistente.",
      data: publicUser(user),
    });
  } catch (error) {
    return sendControllerError(res, error, "No se pudo iniciar sesión.");
  }
};