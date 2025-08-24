
# How to Run the Application

This guide explains how to run the **Rick & Morty** application locally:
- **Backend:** Express 5 + Apollo Server (GraphQL) + Sequelize + Redis
- **Frontend:** React 18 + Vite + Apollo Client + TailwindCSS

> TL;DR – Start backend on **http://localhost:4000**, start frontend on **http://localhost:5173** with `VITE_API_URL=http://localhost:4000/graphql`.

---

## 1) Prerequisites

- **Node.js** 18+ (works on 20/22)
- **npm** 8+
- Relational DB: **PostgreSQL** (recommended) or MySQL
- **Redis** server (local or managed)
- Internet access (seeding from the public Rick & Morty API)

Optional:
- **Git**

---

## 2) Backend (GraphQL API)

Repository name (example): `rickmorty-graphql-api`

### 2.1. Clone & install
```bash
git clone <your-repo-url>/rickmorty-graphql-api.git
cd rickmorty-graphql-api
npm i
```

### 2.2. Environment variables
Create `.env` in the backend root based on `.env.example`. Typical local setup (PostgreSQL + Redis):

```dotenv
# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rickmorty
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=4000
JSON_LIMIT=200kb
CORS_ORIGIN=http://localhost:5173
```

> If your DB requires SSL, set `DB_SSL=true`. For managed services, paste their connection strings.

### 2.3. Database create & migrate
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
# If needed, specify config path:
# npx sequelize-cli db:migrate --config src/db/config.cjs
```

### 2.4. Seed data (ALL characters from public API)
Run the seed script provided by the repo (one of the following, depending on your `package.json`):
```bash
npm run seed:all
# or
npm run seed:rmapi:all
# or
node scripts/seed-all.mjs
```
The seed should be idempotent (no duplicates if you keep a unique `apiId`).

### 2.5. Start backend
```bash
# dev (nodemon)
npm run dev

# or plain
npm start
```
Endpoints:
- GraphQL: `http://localhost:4000/graphql`
- Swagger UI: `http://localhost:4000/docs`
- Health: `http://localhost:4000/health`

If CORS errors appear from the frontend, ensure `CORS_ORIGIN=http://localhost:5173` in `.env`.

### 2.6. (Optional) Redis cache helpers
```bash
npm run cache:clear
```
If you see `ERR wrong number of arguments for 'del' command`, ensure your script expands keys properly (e.g., `client.DEL(...keys)`).

---

## 3) Frontend (React 18 + Vite)

Repository name (example): `rickmorty-frontend`

### 3.1. Clone & install
```bash
git clone <your-repo-url>/rickmorty-frontend.git
cd rickmorty-frontend
npm i
```

### 3.2. Environment variables
Create `.env` in the frontend root:
```dotenv
VITE_API_URL=http://localhost:4000/graphql
```

### 3.3. Run dev server
```bash
npm run dev
```
Vite will show something like `http://localhost:5173`. Make sure backend is running.

### 3.4. Build & preview
```bash
npm run build
npm run preview
```

### 3.5. Tests (if enabled)
```bash
npm run test
npm run test:watch
npm run test:coverage
```

---

## 4) Typical Local Workflow

1) Start **PostgreSQL/MySQL** and **Redis**.  
2) Backend:
   - `npm i`
   - `.env` (see example above)
   - `npx sequelize-cli db:create`
   - `npx sequelize-cli db:migrate`
   - `npm run seed:all` *(or the seed script provided)*
   - `npm run dev`
3) Frontend:
   - `npm i`
   - `.env` with `VITE_API_URL=http://localhost:4000/graphql`
   - `npm run dev`

Open the app and verify:
- List of characters (cards with image, name, species)
- Sorting A→Z / Z→A
- Filters (status, species, gender), search (starts-with), favorites
- Comment creation/deletion
- Pagination by pages (e.g., 50 per page)
- Responsive layout (TailwindCSS, Flexbox/Grid)

---

## 5) Troubleshooting

**CORS**  
Set `CORS_ORIGIN` in backend `.env` to match your frontend origin (`http://localhost:5173`). Restart backend.

**“Cannot use import statement outside a module”**  
Backend `package.json` should include `"type": "module"`. For Sequelize CLI config, use `.cjs` (e.g., `src/db/config.cjs`).

**Sequelize CLI config not found**  
Ensure `.sequelizerc` points to `src/db/config.cjs`, or pass `--config src/db/config.cjs` to CLI commands.

**Redis connection**  
Verify `REDIS_URL` and that Redis is reachable. Local default is `redis://localhost:6379`.

**Windows shell redirection issues**  
Use Node scripts instead of bash heredocs; avoid shell-specific operators if you're on PowerShell.

---

## 6) Production (High Level)

- Run the backend behind a reverse proxy (NGINX/Cloud).
- Configure `CORS_ORIGIN` to your real frontend domain.
- Store secrets in a secure secret manager; don’t commit `.env`.
- Frontend: `npm run build` and serve the static files (or proxy them via your backend).

---

## 7) Local URLs (defaults)

- GraphQL: `http://localhost:4000/graphql`
- Swagger: `http://localhost:4000/docs`
- Health: `http://localhost:4000/health`
- Frontend (Vite): `http://localhost:5173`

Happy hacking! 🚀
