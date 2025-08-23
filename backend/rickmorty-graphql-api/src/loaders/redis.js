// src/loaders/redis.js
import "dotenv/config";
import { createClient } from "redis";

export async function initRedis() {
  const url = process.env.REDIS_URL; // usa rediss:// si hay TLS
  if (!url) {
    throw new Error("Falta REDIS_URL en .env (p.ej. redis://127.0.0.1:6379)");
  }

  const client = createClient({ url });

  client.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  await client.connect();
  console.log("✅ Redis conectado");
  return client;
}
