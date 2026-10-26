import { matchedData, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }
  return next();
};

export const requireMatchedBody = (req, res, next) => {
  if (Object.keys(matchedData(req, { locations: ["body"] })).length === 0) {
    return res.status(400).json({
      message: "Debe enviar al menos un campo válido para actualizar.",
    });
  }
  return next();
};