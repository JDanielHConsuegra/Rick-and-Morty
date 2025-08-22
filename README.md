# Rick & Morty GraphQL API

An **Express 5 + GraphQL (Apollo Server)** API to search *Rick and Morty* characters, powered by **Sequelize** (PostgreSQL or MySQL), database **migrations**, **initial seed**, **Redis** caching, and **Swagger UI** for browser-based testing.

## 🚀 Features

- **GraphQL** (`/graphql`)
  - `characters(filter, limit, offset)` – filters with **AND** logic: `status`, `species`, `gender` (equality) and `name`, `origin` (substring match; case-insensitive on Postgres via iLIKE).
  - `character(id)` – detail by internal ID.
  - `charactersConnection(filter, first, after)` – **cursor-based pagination** (by ascending `id`).
  - `filterOptions` – distinct values for quick UI filters (`statuses`, `species`, `genders`, `origins`).
  - **Mutations**: `createCharacter`, `updateCharacter`, `deleteCharacter`.
- **Relational DB** (Sequelize)
  - Migration + model `Character`.
  - **Initial seed (15 characters)** from the public Rick & Morty API (no duplicates thanks to `apiId` uniqueness logic).
- **Redis cache** (+ automatic invalidation on mutations)
  - Caches `characters`, `character`, `charactersConnection`, `filterOptions`.
- **Request logging middleware**
  - Method, path, status, duration, IP, user-agent, and a short GraphQL operation summary.
- **Hardening**
  - JSON body size limit, simple CORS, safe headers, centralized error handling.
- **Swagger UI** at `/docs` (the YAML spec is loaded on-demand).
- **Healthcheck** at `/health` (DB & Redis status).

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
      2025xxxx-seed-characters.js
  docs/
    openapi.yaml        # OpenAPI spec (Swagger)
  index.js              # server (Express + GraphQL + Swagger + health)
.sequelizerc            # sequelize-cli paths -> src/db/*
```

> Note: `src/db/index.mjs` exports `sequelize` and the models for runtime. `sequelize-cli` uses `src/db/config.cjs` (CommonJS) based on `.sequelizerc`.

---

## 🔧 Requirements

- Node.js 18+ (20+ recommended)
- PostgreSQL or MySQL
- Redis (local or cloud)

---

## ⚙️ Environment Variables (.env)

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

> Using a cloud provider that enforces TLS? Use `rediss://` for Redis and set `DB_SSL=true` for the DB.

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

2) Load the initial seed (15 characters from the public API):
```bash
npm run db:seed
```

> The seeder avoids duplicates using `apiId`. If the public API is temporarily unavailable, re-run the seed later.

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

- **`[]` on `characters` with many filters**  
  Filters are **AND**. Start with just `name` to widen results.
- **Seed not visible**  
  Check connectivity/credentials. Re-run `npm run db:seed`.
- **Stale cache**  
  Run `npm run cache:clear` and retry.
- **ESM/CJS issue with sequelize-cli**  
  We use `src/db/config.cjs` + `.sequelizerc` pointing to `src/db/*`, with `src/db/package.json` containing `"type": "commonjs"`.
- **Redis disconnected**  
  Verify `REDIS_URL`. If your provider uses TLS, use `rediss://`. Check `/health`.
- **Swagger not updating**  
  The UI reads `GET /docs.json`. Hard refresh (Ctrl/Cmd+Shift+R) and inspect `http://localhost:4000/docs.json`.

---

## 🐳 (Optional) Docker Compose

Basic Postgres + Redis + API example:

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: rickmorty
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [dbdata:/var/lib/postgresql/data]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  api:
    build: .
    environment:
      DB_DIALECT: postgres
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: rickmorty
      DB_USER: postgres
      DB_PASSWORD: postgres
      REDIS_URL: redis://redis:6379
      PORT: 4000
      CORS_ORIGIN: "*"
    ports: ["4000:4000"]
    depends_on: [db, redis]

volumes:
  dbdata:
```

> Add a `Dockerfile` and (optionally) an entrypoint that runs migrations/seed on startup.

---

## 📜 License

MIT (or your preferred license).
