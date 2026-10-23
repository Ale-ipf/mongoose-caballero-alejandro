import mongoose from "mongoose";

export const startDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("La variable de entorno MONGODB_URI no está definida.");
  }

  await mongoose.connect(mongoUri);
  console.log("Conectado a la base de datos correctamente");
};