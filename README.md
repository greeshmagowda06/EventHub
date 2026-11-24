# EventHub – Secure MERN Event Management System

Initial project scaffold for Atria University Cybersecurity Sprint 1 (Phase 1 and Phase 2 preparation).

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB / MongoDB Atlas
- Authentication: JWT
- Password hashing: bcryptjs
- Static analysis: Semgrep

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string
- Semgrep installed for Phase 2 scanning

## Setup

### 1. Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and set your MongoDB URI and a long random JWT secret.

```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Initial features
- User registration and login
- bcrypt password hashing
- JWT-protected event APIs
- Create, list, update and delete events
- Event ownership enforced through `createdBy`
- Basic backend input validation
- Centralized error handling
- `.env` excluded from Git

## API endpoints

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/events` | Yes | List own events |
| POST | `/api/events` | Yes | Create event |
| PUT | `/api/events/:id` | Yes | Update own event |
| DELETE | `/api/events/:id` | Yes | Delete own event |

The JWT is stored in browser localStorage for this classroom starter. For production, consider a carefully configured secure, HttpOnly cookie design and additional protections.

## Phase 2 – Semgrep
From the project root:
```bash
semgrep --version
semgrep scan --config auto --exclude node_modules --exclude dist --exclude build .
```

Save a baseline JSON report:
```bash
mkdir -p reports/before reports/after
semgrep scan --config auto \
  --exclude node_modules \
  --exclude dist \
  --exclude build \
  --json \
  --output reports/before/semgrep.json .
```

Run the included custom rule:
```bash
semgrep scan --config semgrep-rules/ backend/
semgrep scan --config semgrep-rules/ \
  --json \
  --output reports/before/semgrep-custom.json \
  backend/
```

The custom rule is a pattern detector, not proof that a matching line is exploitable. This starter uses allowlisted fields in its event creation route, so it may correctly report no match in the production route. You can validate the rule against a separate, disposable test snippet without weakening EventHub.

## Important
- Never commit `.env`, passwords, database credentials, or real secrets.
- Use synthetic test users and events.
- Review Semgrep findings manually; not every finding is an exploitable vulnerability.
- This is an educational starting point, not a production-ready deployment.
