# Rick & Morty Monorepo

This repository contains the **backend (GraphQL API)** and **frontend (React 18)** for the Rick & Morty project.

```
Rick-and-Morty/
├── backend/
│   └── rickmorty-graphql-api/
└── frontend/
    └── rickmorty-frontend/
```

---

## 📚 Backend documentation

- **Backend README:**  
  [`backend/rickmorty-graphql-api/README.md`](backend/rickmorty-graphql-api/README.md)

  > Inside the backend README you will find:
  >
  > - The **ERD diagram**: [`backend/rickmorty-graphql-api/src/docs/ERD.md`](backend/rickmorty-graphql-api/src/docs/ERD.md)
  > - **Swagger/OpenAPI** documentation:
  >   - **Swagger UI (when the server is running):** `http://localhost:4000/docs`
  >   - **OpenAPI YAML in repo:** [`backend/rickmorty-graphql-api/src/docs/openapi.yaml`](backend/rickmorty-graphql-api/src/docs/openapi.yaml)

### 🔗 Useful local endpoints (backend)

- GraphQL: `http://localhost:4000/graphql`
- Swagger UI: `http://localhost:4000/docs`
- Health: `http://localhost:4000/health`

---

## 🎨 Frontend

- The frontend app lives in: [`frontend/rickmorty-frontend/`](frontend/rickmorty-frontend/)
- Configure `VITE_API_URL` to point to your backend GraphQL endpoint (e.g. `http://localhost:4000/graphql`).

---

## 🚀 Quick start (local)

1. **Backend** (`backend/rickmorty-graphql-api/`): create `.env` from `.env.example`, run DB migrations & seeds, then start the server (`npm run dev`).
2. **Frontend** (`frontend/rickmorty-frontend/`): create `.env` with `VITE_API_URL`, run `npm run dev`.

Happy hacking! 🚀
