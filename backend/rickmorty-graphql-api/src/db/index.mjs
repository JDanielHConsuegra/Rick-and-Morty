import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";
import defineCharacter from "./models/character.js";

const {
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_HOST = "127.0.0.1",
  DB_PORT,
  DB_DIALECT = "postgres",
  DB_SSL,
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT) || (DB_DIALECT === "mysql" ? 3306 : 5432),
  dialect: DB_DIALECT,
  logging: false,
  dialectOptions:
    DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
});

// Carga de modelos (CommonJS -> default)
const Character = defineCharacter(sequelize, DataTypes);

// Colección de modelos
const models = { Character };

export { sequelize, models };
