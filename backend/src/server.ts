import "reflect-metadata";
import { AppDataSource } from "./shared/database/data-source.js";
import { buildApp } from "./app.js";

async function main() {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a la base creada y tablas sincronizadas!");

    const app = await buildApp();
    const PORT = process.env.VITE_API_PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

main();
