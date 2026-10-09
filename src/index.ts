import { Elysia } from "elysia";
import { userRoutes } from "./routes/users";

const app = new Elysia()
  .get("/", () => ({
    success: true,
    message: "Server is running smoothly with Elysia, Bun, Drizzle, and MySQL!",
    timestamp: new Date().toISOString(),
  }))
  .get("/health", () => ({
    status: "ok",
    uptime: process.uptime(),
  }))
  .use(userRoutes)
  .listen(Number(process.env.PORT) || 3000);

console.log(
  `🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
export default app;
