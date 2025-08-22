import "dotenv/config";
import { createClient } from "redis";

const url = process.env.REDIS_URL;
if (!url) {
  console.error("Falta REDIS_URL en .env");
  process.exit(1);
}

const client = createClient({ url });

async function deleteByPattern(pattern) {
  let total = 0;
  try {
    for await (const key of client.scanIterator({
      MATCH: pattern,
      COUNT: 1000,
    })) {
      try {
        const n = await client.del(key); // ✅ 1 por 1, nunca 0 args
        total += n;
      } catch (e) {
        console.warn(`DEL fallo para ${key}:`, e.message);
      }
    }
  } catch (e) {
    console.warn(`SCAN fallo (${pattern}):`, e.message);
  }
  return total;
}

try {
  await client.connect();

  const d1 = await deleteByPattern("characters:*");
  const d2 = await deleteByPattern("charactersConn:*");
  const d3 = await deleteByPattern("character:*");

  let d4 = 0;
  try {
    d4 = await client.del("filterOptions:v1");
  } catch {}

  console.log(`🧹 Redis cache cleared (${d1 + d2 + d3 + d4} keys).`);
} catch (e) {
  console.error("❌ Error limpiando cache:", e?.message || e);
} finally {
  try {
    await client.quit();
  } catch {}
}
