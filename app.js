import express from "express";
import cors from "cors";
import "dotenv/config";
import { startDB } from "./src/config/database.js";
import { userRouter } from "./src/routes/user.routes.js";
import { taskRouter } from "./src/routes/task.routes.js";
import { roleRouter } from "./src/routes/role.routes.js";
import { tagRouter } from "./src/routes/tag.routes.js";
import { profileRouter } from "./src/routes/profile.routes.js";
import { authRouter } from "./src/routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3005;

//middlewares
app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

//rutas
app.use("/api", userRouter);
app.use("/api", taskRouter);
app.use("/api", roleRouter);
app.use("/api", tagRouter);
app.use("/api", profileRouter);
app.use("/api", authRouter);

const startServer = async () => {
  try {
    await startDB();
    app.listen(PORT, () => {
      console.log(`Servidor listo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exitCode = 1;
  }
};

startServer();