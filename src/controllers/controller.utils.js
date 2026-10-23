export class ControllerError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const pickFields = (source, fields) =>
  Object.fromEntries(
    fields
      .filter((field) => source[field] !== undefined)
      .map((field) => [field, source[field]]),
  );

export const ensureDocumentsExist = async (Model, ids, label) => {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(String))];
  if (uniqueIds.length === 0) return;

  const count = await Model.countDocuments({
    _id: { $in: uniqueIds },
    deletedAt: null,
  });

  if (count !== uniqueIds.length) {
    throw new ControllerError(400, `Uno o más ${label} no existen o están eliminados.`);
  }
};

export const sendControllerError = (res, error, fallbackMessage) => {
  if (error instanceof ControllerError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Ya existe un registro con esos datos." });
  }

  console.error(error);
  return res.status(500).json({ message: fallbackMessage });
};

export const notFound = (res, entity) =>
  res.status(404).json({ message: `${entity} no encontrado.` });
