# Crest 🏔️
> A modern, full-stack personal journaling and finance tracking application. Capture your daily reflections, track your emotional highs and lows, and monitor your personal transactions all in one unified workspace.

---

## ✨ Features

- **📖 Journaling Canvas:** Draft and save journal entries with timestamps, mood selectors, and media attachments.
- **💰 Integrated Finance Tracker:** Log income and expenses directly associated with your journal entries, with custom categories and optional transfer notes.
- **🔒 Secure Authentication:** JWT-based authentication with secure HTTP-only cookies and bcrypt password hashing.
- **⚡ Real-time Local State & Debounced Sync:** Instant UI responsiveness powered by Zustand, backed by debounced auto-sync to the PostgreSQL database.
- **📑 Swagger / OpenAPI Documentation:** Interactive API documentation available at `/api-docs`.
- **🐳 One-Command Docker Setup:** Fully containerized multi-service architecture using Docker Compose with automated service health checks.
- **📊 Prisma Studio Support:** Visual web GUI for inspecting and managing database tables and relational records.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Zustand, Lucide Icons, Axios |
| **Backend** | Node.js (v22), Express 5, TypeScript, Prisma 7 ORM, `@prisma/adapter-pg` |
| **Database** | PostgreSQL 16 |
| **DevOps & Tooling** | Docker, Docker Compose, Swagger UI (`swagger-jsdoc`, `swagger-ui-express`) |

---

## 📁 Repository Structure

```text
Crest/
├── docker-compose.yml          # Central multi-container Docker orchestrator
├── README.md                   # Project documentation
├── .gitignore                  # Monorepo-wide git ignore rules
│
├── backend/                    # Express + TypeScript + Prisma API
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma.config.ts        # Prisma 7 configuration file
│   ├── prisma/
│   │   └── schema.prisma       # Database schema models (User, Entry, Transaction)
│   └── src/
│       ├── controllers/        # Request controllers
│       ├── db/                 # Database connection & Prisma client
│       ├── middleware/         # Auth & validation middleware
│       ├── routes/             # Express API routes
│       └── services/           # Business logic & database operations
│
└── frontend/                   # React + Vite + Tailwind Client
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/         # Reusable UI components (JournalCard, etc.)
        ├── layouts/            # AppLayout and AuthLayout
        ├── pages/              # Pages (NewEntryPage, JournalListPage, Login, Signup)
        ├── services/           # Axios API services
        └── store/              # Zustand global state (authStore, journalStore)
```

---

## 🚀 Quickstart with Docker (Recommended)

The easiest way to spin up the entire application (Database, Backend API, and Frontend UI) is using Docker Compose.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Start the Application
From the root of the repository, run:

```bash
docker compose up -d --build
```

### 3. Access the Services

| Service | URL | Description |
|---|---|---|
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | Main React web application |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | Express REST API server |
| **API Docs (Swagger)** | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) | Interactive OpenAPI documentation |
| **PostgreSQL Database** | `localhost:5432` | Database: `crestDB` \| User: `root` \| Password: `1234` |

---

## 💻 Local Development (Without Docker)

If you prefer running services directly on your host machine:

### 1. Prerequisites
- **Node.js** >= 20.x
- **PostgreSQL** running locally on port `5432`

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables (.env)
cp .env.example .env # or create .env with:
# DATABASE_URL="postgresql://root:1234@localhost:5432/crestDB?schema=public"
# JWT_SECRET="your_jwt_secret"
# PORT=8080

# Push schema to PostgreSQL
npx prisma db push

# Start development server with live reload
npm run dev
```

The backend server will start on [http://localhost:8080](http://localhost:8080).

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend client will open on [http://localhost:5173](http://localhost:5173).

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port for the Express server | `8080` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://root:1234@localhost:5432/crestDB?schema=public` |
| `JWT_SECRET` | Secret key for signing auth tokens | `your_super_secret_jwt_key` |

### Frontend (`frontend/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

---

## 🗄️ Database Management & Visualization

### 1. Visualizing Data with Prisma Studio
Inspect, search, and edit database records directly in an interactive browser GUI:

```bash
cd backend
npx prisma studio
```
Opens in your browser at [http://localhost:5555](http://localhost:5555).

### 2. Direct PostgreSQL CLI (`psql`) via Docker
Connect to the running PostgreSQL container from your terminal:

```bash
docker compose exec -it db psql -U root -d crestDB
```

Useful commands inside `psql`:
- `\dt` — List all tables (`User`, `Entry`, `Transaction`)
- `SELECT * FROM "User";` — Query users
- `SELECT * FROM "Entry";` — Query entries
- `\q` — Exit

---

## 📡 API Endpoints

### Authentication (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/signup` | Register a new user |
| `POST` | `/api/users/login` | Log in and receive JWT cookie |
| `POST` | `/api/users/forgot-password` | Request password reset token |
| `POST` | `/api/users/reset-password` | Reset password using valid token |

### Journal Entries & Transactions (`/api/entries`)
*(Requires Bearer token or auth cookie)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/entries` | Create a new journal entry |
| `GET` | `/api/entries` | Fetch all entries for authenticated user |
| `PUT` | `/api/entries/:id` | Update an existing journal entry & sync transactions |
| `DELETE` | `/api/entries/:id` | Delete a journal entry (cascades to transactions) |

---

## 🐳 Docker Management Reference

```bash
# View container status
docker compose ps

# Follow application logs in real time
docker compose logs -f

# Follow specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Stop all containers
docker compose down

# Stop and wipe database data volume for a clean state
docker compose down -v
```

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
