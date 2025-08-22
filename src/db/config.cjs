require("dotenv").config();

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432, // 3306 si MySQL
  dialect: process.env.DB_DIALECT || "postgres", // 'mysql' si usas MySQL
  logging: console.log,
  // Habilita SSL opcional (útil para Railway/Cloud)
  dialectOptions: {},
};

if (process.env.DB_SSL === "true") {
  common.dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

module.exports = {
  development: { ...common },
  test: {
    ...common,
    database: process.env.DB_NAME_TEST || process.env.DB_NAME + "_test",
    logging: false,
  },
  production: { ...common, logging: false },
};
