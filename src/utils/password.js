import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const saltLength = 16;
const keyLength = 64;

export const hashPassword = async (password) => {
  const salt = randomBytes(saltLength).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

export const passwordMatches = async (password, storedHash) => {
  const [algorithm, salt, key] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !key || !/^[a-f\d]+$/i.test(key)) {
    return false;
  }

  const expectedKey = Buffer.from(key, "hex");
  if (expectedKey.length !== keyLength) return false;

  const derivedKey = await scrypt(password, salt, keyLength);
  return timingSafeEqual(expectedKey, derivedKey);
};
