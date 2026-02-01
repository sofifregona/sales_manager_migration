import "reflect-metadata";
import { AppDataSource } from "./shared/database/data-source.js";
import { buildApp } from "./app.js";
import { ensureInitialAccount } from "./modules/account/account.seed.js";
import { ensureInitialAdmin } from "./modules/user/user.seed.js";

async function main() {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a la base creada y tablas sincronizadas!");

    await ensureInitialAccount(AppDataSource);
    await ensureInitialAdmin(AppDataSource);

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
