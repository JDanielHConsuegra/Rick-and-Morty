// src/middleware/requestLogger.js
export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  const { method, originalUrl } = req;
  const ua = req.get("user-agent") || "";
  const ip = (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.ip ||
    ""
  ).trim();
  const len = req.get("content-length");

  // Si es GraphQL, tomamos datos básicos de la operación (sin variables sensibles)
  let gqlInfo = null;
  if (originalUrl.startsWith("/graphql")) {
    const body = req.body || {};
    const op = body.operationName || "anonymous";
    let query = typeof body.query === "string" ? body.query : "";
    query = query.replace(/\s+/g, " ").trim();
    if (query.length > 200) query = query.slice(0, 200) + "…";
    gqlInfo = { op, query };
  }

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000; // ns -> ms
    const line =
      `[${new Date().toISOString()}] ` +
      `${method} ${originalUrl} ` +
      `${res.statusCode} ` +
      `${durationMs.toFixed(1)}ms ` +
      `ip=${ip} ` +
      `ua="${ua}" ` +
      (len ? `len=${len} ` : "");

    console.log(line.trim());

    if (gqlInfo) {
      console.log(`   ↳ GraphQL op=${gqlInfo.op} query="${gqlInfo.query}"`);
    }
  });

  next();
}
