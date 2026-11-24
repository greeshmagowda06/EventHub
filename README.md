# EventHub – Secure MERN Event Management System

**Atria University – Cybersecurity Sprint 1**

EventHub is a MERN-based event management application developed as part of the Cybersecurity Sprint. It allows users to register, log in, and manage their own events through a secure, authenticated web application.

## 1. Technology Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB / MongoDB Atlas
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcryptjs
- **Security Headers:** Helmet
- **Rate Limiting:** express-rate-limit
- **Static Security Analysis:** Semgrep

## 2. Project Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected event management APIs
- Create, view, update, and delete events
- Event ownership verification
- Input validation and error handling
- Event date validation
- API rate limiting
- Security headers using Helmet
- Environment variables for sensitive configuration

## 3. Project Structure

```text
EventHub/
│
├── .github/
│   └── workflows/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Event.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── eventRoutes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── reports/
│   ├── before/
│   │   ├── semgrep.json
│   │   ├── semgrep-custom.json
│   │   └── findings-summary.md
│   ├── after/
│   │   ├── semgrep.json
│   │   ├── semgrep-custom.json
│   │   └── findings-summary.md
│   └── comparison-report.md
│
├── semgrep-rules/
│   └── input-validation.yml
│
├── .gitignore
└── README.md
```

## 4. Requirements

- Node.js 18 or later
- npm
- MongoDB local installation or MongoDB Atlas account
- Python and Semgrep for security scanning
- Visual Studio Code (recommended)

## 5. Installation and Setup

### Backend Setup

Open a terminal in the project directory:

```powershell
cd backend
npm install
```

Copy `.env.example` to `.env` and configure the required environment variables, including:

- MongoDB connection string
- JWT secret
- Server port
- Frontend client URL

Start the backend:

```powershell
npm run dev
```

If the Nodemon command fails on Windows, use:

```powershell
node server.js
```

Backend URL:

`http://localhost:5000`

### Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

### Health Check

Verify the backend using:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

Expected response:

```json
{
  "status": "ok",
  "service": "EventHub API"
}
```

## 6. API Endpoints

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | API health check |
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Authenticate a user |
| GET | `/api/events` | Yes | View own events |
| POST | `/api/events` | Yes | Create an event |
| PUT | `/api/events/:id` | Yes | Update own event |
| DELETE | `/api/events/:id` | Yes | Delete own event |

All event endpoints require a valid Bearer JWT token.

## 7. Security Controls Implemented

### Authentication and Password Security

- Passwords are hashed using bcryptjs with 12 salt rounds.
- Passwords are never returned in API responses.
- Passwords must contain at least 8 characters.
- JWT authentication protects event routes.
- JWT tokens expire after 2 hours.
- Missing JWT configuration is checked.

### Authorization

- Each event is associated with its creator through `createdBy`.
- Users can view only their own events.
- Update and delete operations verify event ownership.
- Unauthenticated requests are rejected.

### Input Validation

- Event names and venues have length restrictions.
- Event dates are validated as real calendar dates.
- Event times must follow the HH:MM format.
- Event categories are checked against an allowlist.
- Event descriptions have a maximum length.
- Event IDs are validated before database operations.

### Backend Security

- Helmet provides HTTP security headers.
- CORS restricts permitted frontend origins.
- JSON request bodies are limited to 20 KB.
- Authentication endpoints have rate limiting.
- Event endpoints have rate limiting.
- Centralized error handling avoids exposing internal error details.

## 8. Functional Testing

The application was tested against the 10 functional requirements.

| No. | Test Case | Result |
|---|---|---|
| 1 | Register a new user | Passed |
| 2 | Login with valid credentials | Passed |
| 3 | Reject invalid login credentials | Passed |
| 4 | Create an event | Passed |
| 5 | View saved events | Passed |
| 6 | Update an event | Passed |
| 7 | Delete an event | Passed |
| 8 | Logout | Passed |
| 9 | Reject unauthenticated API access | Passed |
| 10 | Verify password hashing in MongoDB | Passed |

Additional validation tests after security improvements:

- Valid event creation — Passed.
- Invalid calendar date rejection — Passed.
- Login after authentication changes — Passed.
- Registration after authentication changes — Passed.
- Event loading after backend changes — Passed.

## 9. Phase 2 – Semgrep Security Scanning

Semgrep was used to perform static security analysis of the EventHub application.

Check the installed version:

```powershell
semgrep --version
```

Run the automatic scan:

```powershell
semgrep scan --config auto --exclude node_modules --exclude dist --exclude build .
```

Save the baseline scan:

```powershell
semgrep scan --config auto --exclude node_modules --exclude dist --exclude build --json -o reports/before/semgrep.json .
```

### Custom Semgrep Rule

A custom rule was created in:

`semgrep-rules/input-validation.yml`

Rule ID:

`direct-request-body-in-create`

Detection pattern:

```yaml
pattern: $MODEL.create(req.body)
```

The rule checks for direct use of the complete request body in database creation operations.

Run the custom scan:

```powershell
semgrep scan --config semgrep-rules/ backend/
```

Save the custom baseline report:

```powershell
semgrep scan --config semgrep-rules/input-validation.yml --json -o reports/before/semgrep-custom.json backend/
```

### Custom Rule Verification

The custom rule was tested using a temporary JavaScript file containing:

```javascript
await Event.create(req.body);
```

Semgrep detected one finding during this controlled test. The temporary file was subsequently removed.

## 10. Before-and-After Scan Results

### Automatic Scan

| Metric | Before | After |
|---|---:|---:|
| Semgrep version | 1.186.0 | 1.186.0 |
| Rules executed | 251 | 251 |
| Files scanned | 24 | 28 |
| Findings | 0 | 0 |
| Blocking findings | 0 | 0 |

### Custom Scan

| Metric | Before | After |
|---|---:|---:|
| Custom rules | 1 | 1 |
| Backend files scanned | 7 | 7 |
| Findings | 0 | 0 |

**Interpretation:** The configured Semgrep rules detected no matching issues in the scanned application files. The custom rule was separately verified using a controlled test case.

Zero findings do not guarantee that the application is completely vulnerability-free.

## 11. Security Remediation

The following improvements were implemented:

1. Improved JWT authentication middleware.
2. Added JWT secret configuration checks.
3. Added validation for JWT user IDs.
4. Improved event date validation.
5. Added password minimum-length validation.
6. Improved email validation.
7. Added event API rate limiting.
8. Preserved event ownership authorization.
9. Preserved bcrypt password hashing.
10. Generated after-scan security reports.

## 12. Git Version Control

The project baseline and security improvements were committed to Git.

Important Git checkpoints:

- `f3aaeb1` – Initial MERN application baseline
- `f88fd53` – Add baseline Semgrep security scan reports
- `b6654f7` – Apply security improvements and add after-scan reports

Baseline tag:

`baseline-v1`

## 13. Important Security Notes

- Never commit `.env` files or database credentials.
- Use synthetic test accounts and event data.
- Keep `.env.example` free of real credentials.
- Review Semgrep findings manually.
- Do not treat zero static-analysis findings as proof of complete security.
- The application is an educational cybersecurity project and requires further testing before production deployment.

---

**Project:** EventHub – Secure MERN Event Management System  
**Institution:** Atria University  
**Sprint:** Cybersecurity Sprint 1  
**Focus:** MERN Development, Application Security and DevSecOps