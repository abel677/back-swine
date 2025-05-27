import { envConfig } from "./config/envs";
import { PrismaConnection } from "./config/prisma/prisma.connection";
import { AppRoutes } from "./config/express/routes";
import { Server } from "./config/express/server";
import { dependencyInjection } from "./config/express/dependency-injection";

const { PORT } = envConfig;

(() => {
  main();
})();

async function main() {
  await PrismaConnection.connect();

  const appRoutes = new AppRoutes(dependencyInjection.controllers);

  const server = new Server({
    port: PORT,
    routes: appRoutes.routes,
  });

  await server.start();
}
