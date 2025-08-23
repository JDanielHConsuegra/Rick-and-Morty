import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { sequelize, models } from "./db/index.mjs";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { initRedis } from "./loaders/redis.js";

// 🔎 Swagger
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";

async function startServer() {
  // DB
  try {
    await sequelize.authenticate();
    console.log("✅ DB conectada correctamente");
  } catch (err) {
    console.error("❌ Error conectando a la DB:", err.message);
    process.exit(1);
  }

  // Redis
  let redis;
  try {
    redis = await initRedis();
    console.log("✅ Redis conectado");
  } catch (err) {
    console.error("❌ No se pudo conectar a Redis:", err.message);
    process.exit(1);
  }

  const app = express();

  // 1) Límite de tamaño JSON
  const JSON_LIMIT = process.env.JSON_LIMIT || "200kb";
  app.use(express.json({ limit: JSON_LIMIT }));

  // 2) Cabeceras de seguridad mínimas
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

  // 3) CORS simple
  app.use((req, res, next) => {
    const origin = process.env.CORS_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Logger
  app.use(requestLogger);

  // 🔎 Swagger UI (carga del YAML en caliente)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Sirve siempre la versión actual del YAML (evita reinicios para ver nuevos examples)
  app.get("/docs.json", (_req, res) => {
    const spec = YAML.load(path.join(__dirname, "docs", "openapi.yaml"));
    res.setHeader("Cache-Control", "no-store");
    res.json(spec);
  });

  // UI que consume la spec desde /docs.json
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerOptions: { url: "/docs.json" },
      customSiteTitle: "Rick & Morty GraphQL — Docs",
    })
  );

  // Apollo Server
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async () => ({ models, redis }),
    })
  );

  // Healthcheck (incluye Redis)
  app.get("/health", async (_req, res) => {
    let redisOk = false;
    try {
      await redis.ping();
      redisOk = true;
    } catch {}
    res.json({
      ok: true,
      db: "connected",
      redis: redisOk ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  });

  // Handlers finales
  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}/graphql`);
    console.log(`📖 Swagger UI en      http://localhost:${PORT}/docs`);
  });

  // Cierre limpio
  const shutdown = async () => {
    await server.stop();
    try {
      await redis.quit();
    } catch {}
    await sequelize.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer();
