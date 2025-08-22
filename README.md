# Rick & Morty GraphQL API

An **Express 5 + GraphQL (Apollo Server)** API to search *Rick and Morty* characters, powered by **Sequelize** (PostgreSQL or MySQL), database **migrations**, **full catalog seed/import**, **Redis** caching, and **Swagger UI** for browser-based testing.

## 🚀 Features

- **GraphQL** (`/graphql`)
  - `characters(filter, limit, offset)` – filters with **AND** logic: `status`, `species`, `gender` (equality) and `name`, `origin` (substring match; case-insensitive on Postgres via iLIKE).
  - `character(id)` – detail by internal ID.
  - `charactersConnection(filter, first, after)` – **cursor-based pagination** (by ascending `id`).
  - `filterOptions` – distinct values for quick UI filters (`statuses`, `species`, `genders`, `origins`).
  - **Mutations**: `createCharacter`, `updateCharacter`, `deleteCharacter`.
- **Relational DB** (Sequelize)
  - Migration + model `Character`.
  - **Full seed/import from the public Rick & Morty API** (all characters; dedup by `apiId`).
- **Redis cache** (+ automatic invalidation on mutations)
  - Caches `characters`, `character`, `charactersConnection`, `filterOptions`.
- **Request logging middleware**
  - Method, path, status, duration, IP, user-agent, and a short GraphQL operation summary.
- **Hardening**
  - JSON body size limit, simple CORS, safe headers, centralized error handling.
- **Swagger UI** at `/docs` (the YAML spec is loaded on-demand).
- **Healthcheck** at `/health` (DB & Redis status).

---

## 🔑 Environment setup (`.env` & `.env.example`)

This repo includes a **`.env.example`** with all required variables. Start by copying it:

```bash
cp .env.example .env
# then edit .env with your local or cloud credentials
```

Key variables to review:
- **DB**: `DB_DIALECT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`
- **Redis**: `REDIS_URL`, `CACHE_TTL_SECONDS`
- **Server**: `PORT`, `JSON_LIMIT`, `CORS_ORIGIN`

> If your DB/Redis provider enforces TLS, use `DB_SSL=true` and `rediss://` for `REDIS_URL`.

---

## 📦 Tech Stack

- Node.js (ESM)
- Express 5
- Apollo Server
- Sequelize 6
- PostgreSQL or MySQL
- Redis
- swagger-ui-express + OpenAPI (YAML)

---

## 📁 Project Structure

```
src/
  graphql/
    resolvers.js
    typeDefs.js
  middleware/
    errorHandler.js
    requestLogger.js
  loaders/
    redis.js
  db/
    config.cjs          # Sequelize config for sequelize-cli (CommonJS)
    package.json        # { "type": "commonjs" } (scoped to /src/db only)
    index.mjs           # Sequelize instance (ESM) used by the app
    models/
      character.js
    migrations/
      2025xxxx-create-characters.js
    seeders/
      2025xxxx-seed-characters-all.js   # full import from public API
  docs/
    openapi.yaml        # OpenAPI spec (Swagger)
    ERD.md              # Database ERD (Mermaid)
index.js                # server (Express + GraphQL + Swagger + health)
.sequelizerc            # sequelize-cli paths -> src/db/*
.env.example            # sample environment variables
```

> Note: `src/db/index.mjs` exports `sequelize` and the models for runtime. `sequelize-cli` uses `src/db/config.cjs` (CommonJS) based on `.sequelizerc`.

---

## ⚙️ Environment Variables (reference)

Full list (mirrors `.env.example`):

```ini
# ----- DB -----
DB_DIALECT=postgres        # postgres | mysql
DB_HOST=localhost
DB_PORT=5432               # 3306 for MySQL
DB_NAME=rickmorty
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false               # true if your provider requires SSL (Railway/Cloud)

# ----- Redis -----
# redis://host:port     (plain TCP)
# rediss://user:pass@host:port  (TLS)
REDIS_URL=redis://127.0.0.1:6379
CACHE_TTL_SECONDS=60

# ----- Server / Security -----
PORT=4000
JSON_LIMIT=200kb
CORS_ORIGIN=*
```

---

## 🗺️ Database ERD

A focused single-table schema optimized for the required filters. See **[`src/docs/ERD.md`](src/docs/ERD.md)** for details.

Quick preview:

```mermaid
erDiagram
  CHARACTER {
    INT id PK
    VARCHAR name
    VARCHAR status
    VARCHAR species
    VARCHAR gender
    VARCHAR origin
    VARCHAR image
    INT apiId
    TIMESTAMP createdAt
    TIMESTAMP updatedAt
  }
```

**Indexes (recommended):**
- B-Tree: `status`, `species`, `gender` (equality filters)
- B-Tree: `origin`, `name` (used by substring search via `ILIKE` on Postgres)
- Unique: `apiId` (prevents duplicate imports)

---

## 🏗️ Installation

```bash
npm install
```

### Useful Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",

    "db:create": "sequelize-cli db:create",
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo",
    "db:migrate:undo:all": "sequelize-cli db:migrate:undo:all",

    "db:seed": "sequelize-cli db:seed:all",
    "db:seed:undo": "sequelize-cli db:seed:undo",
    "db:seed:undo:all": "sequelize-cli db:seed:undo:all",

    "db:reset": "npm run db:migrate:undo:all && npm run db:migrate && npm run db:seed",
    "db:reseed": "npm run db:seed:undo:all && npm run db:seed",

    "cache:clear": "node scripts/cache-clear.mjs"
  }
}
```

---

## 🗄️ Database

1) Create DB & run migrations:
```bash
npm run db:create
npm run db:migrate
```

2) **Full import**: load **all characters** from the public API with the dedicated seeder.
   - If you named it like `2025xxxx-seed-characters-all.js`:
     ```bash
     npx sequelize-cli db:seed --seed 2025xxxx-seed-characters-all.js
     ```
   - If you kept multiple seeders (e.g., a small sample + the full one), you can also run all:
     ```bash
     npm run db:seed
     ```
     > Order matters—ensure the **full** seeder runs last if both exist.

3) Clear Redis cache (so lists reflect the new data immediately):
```bash
npm run cache:clear
```

> The **full** seeder provided wipes the `Characters` table (via `bulkDelete`) **before** inserting the complete catalog.  
> If you prefer to **preserve** existing rows and only insert **missing** ones, remove the deletion step and ensure a **unique index on `apiId`** to avoid duplicates.

---

## ▶️ Run the Server

```bash
npm run dev
# or
npm start
```

- GraphQL: **http://localhost:4000/graphql**
- Swagger UI: **http://localhost:4000/docs**
- Spec JSON (live): **http://localhost:4000/docs.json**
- Health: **http://localhost:4000/health**

---

## 📚 Swagger (OpenAPI)

- Spec file: `src/docs/openapi.yaml`.
- Served live via `GET /docs.json`.
- UI at `GET /docs`:
  1. Click **POST /graphql** → **Try it out**.
  2. Choose an **Example** from the dropdown → **Execute**.

**Included Examples:**
- `hello`
- `characters` (simple: `name: "rick"`)
- `charactersStrict` (strict AND filters — may return `[]`)
- `charactersAll` (no filters, `limit: 100`)
- `charactersConnection` (cursor pagination)
- `filterOptions`
- `characterById`
- `createCharacter`
- `updateCharacter`
- `deleteCharacter`

---

## 🧠 GraphQL Examples

### 1) Ping
```graphql
query { hello }
```

### 2) List with filters
```graphql
query ($filter: CharacterFilter, $limit: Int, $offset: Int) {
  characters(filter: $filter, limit: $limit, offset: $offset) {
    id name status species gender origin
  }
}
```
Variables (simple):
```json
{ "filter": { "name": "rick" }, "limit": 5, "offset": 0 }
```

> **Filter semantics:** combined with **AND**.  
> `name`/`origin` → **contains** (case-insensitive on Postgres).  
> `status`/`species`/`gender` → **equality**.

### 3) Cursor-based pagination
```graphql
query ($first: Int, $after: String) {
  charactersConnection(first: $first, after: $after) {
    edges { cursor node { id name } }
    pageInfo { endCursor hasNextPage }
    totalCount
  }
}
```
Variables (first page):
```json
{ "first": 5 }
```

### 4) Detail by ID
```graphql
query ($id: ID!) {
  character(id: $id) {
    id name status species gender origin image apiId
  }
}
```

### 5) Mutations

**Create**
```graphql
mutation ($input: CharacterCreateInput!) {
  createCharacter(input: $input) {
    id name status species gender origin image apiId
  }
}
```
```json
{
  "input": {
    "name": "Bird Person (Custom)",
    "status": "Alive",
    "species": "Bird-Person",
    "gender": "Male",
    "origin": "Bird World",
    "image": "https://example.com/bird.png"
  }
}
```

**Update**
```graphql
mutation ($id: ID!, $input: CharacterUpdateInput!) {
  updateCharacter(id: $id, input: $input) {
    id name status species gender origin image apiId
  }
}
```
```json
{
  "id": 2,
  "input": { "origin": "Earth (C-137)" }
}
```

**Delete**
```graphql
mutation ($id: ID!) {
  deleteCharacter(id: $id)
}
```

---

## ⚡ Cache (Redis)

- TTL configurable via `CACHE_TTL_SECONDS` (default: 60s).
- Keys:
  - Lists: `characters:*`
  - Connections: `charactersConn:*`
  - Details: `character:<id>`
  - Filter options: `filterOptions:v1`
- **Automatic invalidation** on `create/update/delete`:
  - Removes list/connection/filter keys and the affected detail key.
- Manual clear:
```bash
npm run cache:clear
```

---

## 📝 Logging, CORS & Errors

- **requestLogger**: prints method, URL, status, duration, IP, user-agent; if `/graphql`, also operation name and a truncated query.
- **errorHandler**: catches uncaught errors and replies with a standard JSON shape.
- **Headers**: `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`.
- **CORS**: `CORS_ORIGIN=*` in development. Adjust for production.
- **JSON limit**: `express.json({ limit: JSON_LIMIT })`.

---

## ❤️ Healthcheck

`GET /health` → `{ ok, db, redis?, uptime }`

- `db: "connected"` if DB responds.
- `redis: "connected"` if Redis responds to `PING`.

---

## 🧪 Troubleshooting

- **Empty results after switching DB**  
  Run migrations, execute the **full import** seeder, then `npm run cache:clear`.
- **`[]` on `characters` with many filters**  
  Filters are **AND**. Start with just `name` to widen results.
- **ESM/CJS issue with sequelize-cli**  
  We use `src/db/config.cjs` + `.sequelizerc` pointing to `src/db/*`, with `src/db/package.json` containing `"type": "commonjs"`.
- **Redis disconnected**  
  Verify `REDIS_URL`. If your provider uses TLS, use `rediss://`. Check `/health`.
- **Swagger not updating**  
  The UI reads `GET /docs.json`. Hard refresh (Ctrl/Cmd+Shift+R) and inspect `http://localhost:4000/docs.json`.

---

## 📜 License

MIT (or your preferred license).
