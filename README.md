# TALHospitals — Appointment & Patient Management System

A full-stack hospital management module: patients book and track appointments, doctors manage
their queue and write prescriptions, and admins monitor operations across departments.

Built for **Project 2** of the TALHospitals internship tasks, covering authentication,
role-based access, REST APIs, MongoDB schema design, and a React frontend.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19 (Vite), React Router, Tailwind CSS, Recharts, Axios |
| Backend    | Node.js, Express |
| Database   | MongoDB with Mongoose |
| Auth       | JWT (httpOnly cookie + Bearer token), bcrypt password hashing |
| Validation | express-validator |
| File uploads | Multer (medical reports) |

## Project Structure

```
tal-hospitals/
├── backend/                 # Express REST API
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers / business logic
│   │   ├── middleware/      # auth, error handling, validation, upload
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # AppError, asyncHandler, pagination, seed script
│   │   └── app.js, server.js
│   ├── .env.example
│   └── package.json
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios calls per resource
│   │   ├── components/       # Shared UI + feature components
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useFetch
│   │   ├── pages/             # patient/, doctor/, admin/ route pages
│   │   └── routes/            # ProtectedRoute
│   ├── .env.example
│   └── package.json
└── docs/
    ├── API_DOCUMENTATION.md
    └── DATABASE_SCHEMA.md
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

## Setup — Backend

```bash
cd backend
cp .env.example .env       # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed                # optional: populates demo departments, doctors, patients
npm run dev                  # starts on http://localhost:5000
```

Health check: `GET http://localhost:5000/api/v1/health`

### Seeded demo accounts (after `npm run seed`)

| Role    | Email                             | Password     |
|---------|------------------------------------|--------------|
| Admin   | admin@talhospitals.com             | Admin@1234   |
| Doctor  | aditi.sharma@talhospitals.com      | Doctor@1234  |
| Patient | arjun.verma@example.com            | Patient@1234 |

## Setup — Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL, defaults to http://localhost:5000/api/v1
npm install
npm run dev                  # starts on http://localhost:5173
```

Open `http://localhost:5173`, register a patient account (or log in with a seeded account),
and explore the role-specific dashboard.

## Core Modules Implemented

**Authentication** — registration, login, JWT (cookie + bearer), role-based access
(`patient`, `doctor`, `admin`), password update.

**Patient module** — profile management, appointment booking, appointment history,
reschedule/cancel, medical report upload (PDF/JPG/PNG/DOC), prescription viewing.

**Doctor module** — view assigned appointments, approve/reject/complete bookings,
add prescriptions (auto-completes the appointment), manage weekly availability, edit profile.

**Admin module** — manage doctors and departments, view/search all patients, monitor all
appointments, and an analytics dashboard (overview KPIs, department performance, doctor
utilization, patient demographics by city/gender/age).

**Appointment module** — book, reschedule (with slot-conflict checking), cancel, and a
status state machine (`pending → approved/rejected → completed/cancelled`, plus `rescheduled`).

**API layer** — REST endpoints under `/api/v1`, request validation, centralized error handling,
pagination (`page`/`limit`/`meta`), search/filter query params, rate limiting on auth routes.

See [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md) for the full endpoint reference
and [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) for the data model.

## Deployment Notes

- **Backend**: deploy to Render/Railway/EC2; set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`,
  `NODE_ENV=production` as environment variables. MongoDB Atlas is recommended for the database.
- **Frontend**: `npm run build` produces a static `dist/` folder deployable to Vercel/Netlify;
  set `VITE_API_URL` to the deployed backend's `/api/v1` URL.
- Uploaded medical reports are stored on local disk (`backend/uploads/`) and served statically
  at `/uploads/<filename>`. For production, swap this for S3/Cloud Storage.

## Known Limitations (by design, given project scope)

- Payments are not integrated; `consultationFee`/`treatmentCost` are tracked as data only.
- Notifications (email/SMS) are not implemented.
- File storage is local disk rather than cloud object storage.
