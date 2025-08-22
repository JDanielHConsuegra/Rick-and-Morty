// src/middleware/errorHandler.js
export function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(err, req, res, _next) {
  // Log básico (ya tienes requestLogger para más contexto)
  console.error("Unhandled error:", err?.message || err);

  // Algunos errores de express.json vienen con status
  const status = err.status || err.statusCode || 500;
  const message =
    status >= 500 ? "Internal Server Error" : err.message || "Error";

  res.status(status).json({ error: message });
}
