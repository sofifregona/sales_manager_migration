import express from "express";
import cors from "cors";
import "reflect-metadata";
import { AppDataSource } from "./data-source.js";
import bartableRoutes from "./routes/bartableRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import categoriesRoutes from "./routes/categoryRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
<<<<<<< HEAD
import saleRoutes from "./routes/saleRoutes.js";
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan("dev"));
app.use("/api", bartableRoutes);
app.use("/api", brandRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", employeeRoutes);
app.use("/api", paymentRoutes);
app.use("/api", providerRoutes);
app.use("/api", productRoutes);
<<<<<<< HEAD
app.use("/api", saleRoutes);
=======
>>>>>>> 2c21897ddc037d935a9673d29fec969a36085b87

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Conexión a la base creada y tablas sincronizadas!");

    const PORT = process.env.VITE_API_PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => console.error(error));
