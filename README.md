# Crest

A modern journaling and finance tracking application.

## Repository Architecture

This is a unified full-stack monorepo:

- **`backend/`**: Node.js, Express, TypeScript, and Prisma ORM connected to PostgreSQL.
- **`frontend/`**: React 19, TypeScript, Vite, Tailwind CSS, and Zustand.
- **`docker-compose.yml`**: Centralized Docker orchestrator running the frontend, backend, and PostgreSQL database.

---

## Quickstart with Docker

To start all services (database, backend API, and frontend UI):

```bash
docker compose up -d --build
```

### Services & URLs:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Swagger Documentation:** [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
- **PostgreSQL Database:** `localhost:5432` (database: `crestDB`, user: `root`)

---

## Useful Docker Commands

```bash
# Check status of all containers
docker compose ps

# View live application logs
docker compose logs -f

# Stop all containers
docker compose down

# Stop and wipe database volume for a fresh start
docker compose down -v
```
