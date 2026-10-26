import "dotenv/config";
import mongoose from "mongoose";

mongoose.set("autoIndex", false);

const { User } = await import("../src/models/user.model.js");
const { Role } = await import("../src/models/role.model.js");
const { Tag } = await import("../src/models/tag.model.js");

const modelsAndFields = [
  [User, ["username", "email"]],
  [Role, ["rolename"]],
  [Tag, ["name"]],
];

const verifyNoActiveDuplicates = async (Model, fields) => {
  for (const field of fields) {
    const [duplicate] = await Model.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: `$${field}`,
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ]);

    if (duplicate) {
      throw new Error(
        `No se pueden crear índices: hay valores activos duplicados en ${Model.collection.name}.${field}.`,
      );
    }
  }
};

const migrateUniqueIndexes = async (Model, fields) => {
  const collections = await mongoose.connection.db
    .listCollections({ name: Model.collection.name })
    .toArray();
  const indexes = collections.length ? await Model.collection.indexes() : [];

  for (const index of indexes) {
    const [field] = Object.keys(index.key);
    const hasActiveOnlyFilter =
      index.partialFilterExpression?.deletedAt === null &&
      Object.keys(index.partialFilterExpression).length === 1;
    const isLegacyUniqueIndex =
      index.unique &&
      !hasActiveOnlyFilter &&
      fields.includes(field) &&
      Object.keys(index.key).length === 1;

    if (isLegacyUniqueIndex) {
      await Model.collection.dropIndex(index.name);
      console.log(`Se eliminó el índice único global ${Model.collection.name}.${index.name}`);
    }
  }

  await Model.createIndexes();
};

try {
  if (!process.env.MONGODB_URI) {
    throw new Error("La variable de entorno MONGODB_URI no está definida.");
  }

  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
  for (const [Model, fields] of modelsAndFields) {
    await verifyNoActiveDuplicates(Model, fields);
  }
  for (const [Model, fields] of modelsAndFields) {
    await migrateUniqueIndexes(Model, fields);
  }
  console.log("Índices para borrado lógico migrados correctamente.");
} catch (error) {
  console.error("No se pudieron migrar los índices:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
