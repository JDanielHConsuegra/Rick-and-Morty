// src/graphql/resolvers.js
import { Op, fn, col } from "sequelize";
import { createHash } from "node:crypto";

const LIKE = process.env.DB_DIALECT === "postgres" ? Op.iLike : Op.like;
const TTL = Number(process.env.CACHE_TTL_SECONDS || 60);

// ---- helpers de clave/caché ----
function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
function keyForCharacters(args) {
  const base = stableStringify({
    limit: args.limit ?? 20,
    offset: args.offset ?? 0,
    filter: args.filter ?? {},
  });
  return "characters:" + createHash("sha1").update(base).digest("hex");
}
function keyForCharacter(id) {
  return `character:${id}`;
}
function keyForCharactersConn(args) {
  const base = stableStringify({
    first: args.first ?? 20,
    after: args.after ?? null,
    filter: args.filter ?? {},
  });
  return "charactersConn:" + createHash("sha1").update(base).digest("hex");
}
const KEY_FILTER_OPTIONS = "filterOptions:v1";

// ---- helpers de filtros & cursores ----
function buildWhere(filter = {}) {
  const where = {};
  const { status, species, gender, name, origin } = filter;
  if (status) where.status = status;
  if (species) where.species = species;
  if (gender) where.gender = gender;
  if (name) where.name = { [LIKE]: `%${name}%` };
  if (origin) where.origin = { [LIKE]: `%${origin}%` };
  return where;
}

function encodeCursor(id) {
  return Buffer.from(`id:${id}`).toString("base64");
}
function decodeCursor(cursor) {
  try {
    const raw = Buffer.from(cursor, "base64").toString("utf8");
    const [, val] = raw.split(":");
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// ---- invalidación de caché ----
async function invalidateLists(redis) {
  if (!redis) return;
  try {
    // Usamos scan para borrar por prefijo sin bloquear el servidor
    for await (const key of redis.scanIterator({ MATCH: "characters:*" })) {
      await redis.del(key);
    }
    for await (const key of redis.scanIterator({ MATCH: "charactersConn:*" })) {
      await redis.del(key);
    }
    // Opcional: refrescar a demanda, pero aquí solo invalidamos opciones
    await redis.del(KEY_FILTER_OPTIONS);
  } catch (e) {
    console.warn("⚠️ Error invalidando listas en Redis:", e.message);
  }
}
async function invalidateCharacter(redis, id) {
  if (!redis) return;
  try {
    await redis.del(keyForCharacter(id));
  } catch (e) {
    console.warn("⚠️ Error invalidando character en Redis:", e.message);
  }
}

async function distinctValues(models, field) {
  const rows = await models.Character.findAll({
    attributes: [[fn("DISTINCT", col(field)), field]],
    where: { [field]: { [Op.ne]: null } },
    order: [[field, "ASC"]],
    raw: true,
  });
  return rows
    .map((r) => r[field])
    .filter((v) => v != null && `${v}`.trim() !== "");
}

const resolvers = {
  Query: {
    hello: () => "Hola Rick & Morty API 🚀",

    // Lista con offset/limit y cache
    characters: async (_parent, args, ctx) => {
      const { models, redis } = ctx;
      const key = keyForCharacters(args);

      if (redis) {
        try {
          const cached = await redis.get(key);
          if (cached) return JSON.parse(cached);
        } catch (e) {
          console.warn("Redis get fallo (characters):", e.message);
        }
      }

      const { limit = 20, offset = 0, filter } = args;
      const where = buildWhere(filter);
      const rows = await models.Character.findAll({
        where,
        limit: Math.min(limit, 100),
        offset: Math.max(offset, 0),
        order: [["id", "ASC"]],
      });

      if (redis) {
        try {
          await redis.set(key, JSON.stringify(rows), { EX: TTL });
        } catch (e) {
          console.warn("Redis set fallo (characters):", e.message);
        }
      }

      return rows;
    },

    // Detalle con cache
    character: async (_parent, { id }, ctx) => {
      const { models, redis } = ctx;
      const key = keyForCharacter(id);

      if (redis) {
        try {
          const cached = await redis.get(key);
          if (cached) return JSON.parse(cached);
        } catch (e) {
          console.warn("Redis get fallo (character):", e.message);
        }
      }

      const row = await models.Character.findByPk(id);

      if (redis && row) {
        try {
          await redis.set(key, JSON.stringify(row), { EX: TTL });
        } catch (e) {
          console.warn("Redis set fallo (character):", e.message);
        }
      }

      return row;
    },

    // Opciones de filtro cacheadas
    filterOptions: async (_p, _a, ctx) => {
      const { models, redis } = ctx;

      if (redis) {
        try {
          const cached = await redis.get(KEY_FILTER_OPTIONS);
          if (cached) return JSON.parse(cached);
        } catch (e) {
          console.warn("Redis get fallo (filterOptions):", e.message);
        }
      }

      const [statuses, species, genders, origins] = await Promise.all([
        distinctValues(models, "status"),
        distinctValues(models, "species"),
        distinctValues(models, "gender"),
        distinctValues(models, "origin"),
      ]);

      const payload = { statuses, species, genders, origins };

      if (redis) {
        try {
          await redis.set(KEY_FILTER_OPTIONS, JSON.stringify(payload), {
            EX: Math.max(TTL, 120),
          });
        } catch (e) {
          console.warn("Redis set fallo (filterOptions):", e.message);
        }
      }

      return payload;
    },

    // Conexión cursoreada
    charactersConnection: async (_p, args, ctx) => {
      const { models, redis } = ctx;
      const key = keyForCharactersConn(args);

      if (redis) {
        try {
          const cached = await redis.get(key);
          if (cached) return JSON.parse(cached);
        } catch (e) {
          console.warn("Redis get fallo (charactersConnection):", e.message);
        }
      }

      const first = Math.max(1, Math.min(Number(args.first ?? 20), 100));
      const where = buildWhere(args.filter || {});
      const afterId = args.after ? decodeCursor(args.after) : null;
      if (afterId != null) {
        where.id = { ...(where.id || {}), [Op.gt]: afterId };
      }

      const rows = await models.Character.findAll({
        where,
        order: [["id", "ASC"]],
        limit: first + 1,
      });

      const hasNextPage = rows.length > first;
      const pageRows = rows.slice(0, first);

      const edges = pageRows.map((node) => ({
        node,
        cursor: encodeCursor(node.id),
      }));

      const endCursor = edges.length ? edges[edges.length - 1].cursor : null;
      const totalCount = await models.Character.count({ where });

      const payload = {
        edges,
        pageInfo: { endCursor, hasNextPage },
        totalCount,
      };

      if (redis) {
        try {
          await redis.set(key, JSON.stringify(payload), { EX: TTL });
        } catch (e) {
          console.warn("Redis set fallo (charactersConnection):", e.message);
        }
      }

      return payload;
    },
  },

  Mutation: {
    createCharacter: async (_p, { input }, ctx) => {
      const { models, redis } = ctx;

      if (!input?.name || `${input.name}`.trim() === "") {
        throw new Error("El nombre es obligatorio");
      }

      const row = await models.Character.create({
        name: input.name.trim(),
        status: input.status ?? null,
        species: input.species ?? null,
        gender: input.gender ?? null,
        origin: input.origin ?? null,
        image: input.image ?? null,
        apiId: input.apiId ?? null,
      });

      // invalidación
      await invalidateLists(redis);
      await invalidateCharacter(redis, row.id);

      return row;
    },

    updateCharacter: async (_p, { id, input }, ctx) => {
      const { models, redis } = ctx;

      const row = await models.Character.findByPk(id);
      if (!row) throw new Error("Personaje no encontrado");

      // Solo campos permitidos
      const fields = [
        "name",
        "status",
        "species",
        "gender",
        "origin",
        "image",
        "apiId",
      ];
      for (const k of fields) {
        if (k in input) {
          // si es string, trim
          const v = typeof input[k] === "string" ? input[k].trim() : input[k];
          row[k] = v === "" ? null : v;
        }
      }
      await row.save();

      // invalidación
      await invalidateLists(redis);
      await invalidateCharacter(redis, id);

      return row;
    },

    deleteCharacter: async (_p, { id }, ctx) => {
      const { models, redis } = ctx;

      const deleted = await models.Character.destroy({ where: { id } });
      // invalidación
      await invalidateLists(redis);
      await invalidateCharacter(redis, id);

      return deleted > 0;
    },
  },
};

export default resolvers;
