import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { matchedData } from "express-validator";
import { User } from "../models/user.model.js";
import { sendControllerError } from "./controller.utils.js";

const scrypt = promisify(scryptCallback);
const saltLength = 16;
const keyLength = 64;

const hashPassword = async (password) => {
  const salt = randomBytes(saltLength).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

const passwordMatches = async (password, storedHash) => {
  const [algorithm, salt, key] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !key || !/^[a-f\d]+$/i.test(key)) {
    return false;
  }

  const expectedKey = Buffer.from(key, "hex");
  if (expectedKey.length !== keyLength) return false;

  const derivedKey = await scrypt(password, salt, keyLength);
  return timingSafeEqual(expectedKey, derivedKey);
};

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