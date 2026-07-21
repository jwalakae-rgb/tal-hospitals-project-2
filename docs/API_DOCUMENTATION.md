# TALHospitals API Documentation

Base URL: `http://localhost:5000/api/v1`

All request/response bodies are JSON unless noted (file upload uses `multipart/form-data`).
Authenticated routes accept a JWT either as an `Authorization: Bearer <token>` header or an
httpOnly `token` cookie (set automatically on login/register).

## Conventions

**Success response**
```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```
`meta` is only present on paginated list endpoints.

**Error response**
```json
{ "success": false, "status": "fail", "message": "Human-readable error message" }
```

**Roles**: `patient`, `doctor`, `admin`. Public self-registration always creates a `patient`.
Doctor and admin accounts are created by an admin.

---

## Auth — `/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new patient account |
| POST | `/auth/login` | Public | Log in, returns JWT + user |
| POST | `/auth/logout` | Private | Clears auth cookie |
| GET | `/auth/me` | Private | Get current logged-in user |
| PATCH | `/auth/update-password` | Private | Change password |

**POST /auth/register**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Passw0rd", "phone": "9876543210" }
```
→ `201` `{ success, token, data: { user } }`

**POST /auth/login**
```json
{ "email": "jane@example.com", "password": "Passw0rd" }
```
→ `200` `{ success, token, data: { user } }`

---

## Departments — `/departments`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/departments` | Public | List active departments |
| POST | `/departments` | Admin | Create a department |
| PATCH | `/departments/:id` | Admin | Update a department |
| DELETE | `/departments/:id` | Admin | Deactivate (blocked if doctors assigned) |

---

## Doctors — `/doctors`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/doctors` | Public | List/search doctors. Query: `department`, `specialization`, `search`, `page`, `limit` |
| GET | `/doctors/:id` | Public | Get a single doctor |
| POST | `/doctors` | Admin | Create doctor account + profile |
| PATCH | `/doctors/:id` | Admin, own doctor | Update doctor profile fields |
| PATCH | `/doctors/:id/availability` | Admin, own doctor | Replace weekly availability slots |
| DELETE | `/doctors/:id` | Admin | Deactivate doctor account |

**POST /doctors** (admin)
```json
{
  "name": "Dr. Aditi Sharma", "email": "aditi@talhospitals.com", "password": "Doctor@1234",
  "department": "<departmentId>", "specialization": "Cardiologist",
  "experience": 12, "consultationFee": 800
}
```

**PATCH /doctors/:id/availability**
```json
{ "availability": [{ "day": "Monday", "startTime": "09:00", "endTime": "13:00" }] }
```

---

## Patients — `/patients`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/patients/me` | Patient | Get own patient profile |
| PATCH | `/patients/me` | Patient | Update own profile (age, gender, city, address, bloodGroup, emergencyContact) |
| GET | `/patients/me/reports` | Patient | List own uploaded medical reports |
| POST | `/patients/me/reports` | Patient | Upload a report file (`multipart/form-data`, field `report`) |
| GET | `/patients` | Admin, Doctor | List/search patients. Query: `city`, `search`, `page`, `limit` |
| GET | `/patients/:id` | Admin, Doctor | Get a single patient |

---

## Appointments — `/appointments`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/appointments` | Patient | Book an appointment |
| GET | `/appointments/me` | Patient, Doctor | Own appointments. Query: `status`, `page`, `limit` |
| GET | `/appointments` | Admin | All appointments. Query: `status`, `doctor`, `department`, `from`, `to`, `page`, `limit` |
| GET | `/appointments/:id` | Owner / Admin | Get a single appointment |
| PATCH | `/appointments/:id/status` | Doctor (own), Admin | Transition status |
| PATCH | `/appointments/:id/reschedule` | Patient (own), Admin | Change date/time, sets status to `rescheduled` |
| DELETE | `/appointments/:id` | Patient (own), Admin | Cancel (soft-cancel, keeps record) |

**POST /appointments**
```json
{
  "doctorId": "<doctorId>", "appointmentDate": "2026-08-01", "timeSlot": "09:00-09:30",
  "consultationType": "in-person", "reasonForVisit": "Routine checkup"
}
```

**Status state machine**
```
pending      → approved | rejected | cancelled
approved     → completed | cancelled
rescheduled  → approved | rejected | cancelled
```
`completed` and `cancelled` are terminal states. Creating a prescription against an `approved`
appointment automatically transitions it to `completed`.

**PATCH /appointments/:id/status**
```json
{ "status": "approved" }
```
or, for rejection/cancellation:
```json
{ "status": "rejected", "cancellationReason": "Doctor unavailable that day" }
```

---

## Prescriptions — `/prescriptions`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/prescriptions` | Doctor | Add prescription for an approved/completed appointment |
| GET | `/prescriptions/me` | Patient | List own prescriptions |
| GET | `/prescriptions/:id` | Owner / Admin | Get a single prescription |
| PATCH | `/prescriptions/:id` | Doctor (own) | Update a prescription |

**POST /prescriptions**
```json
{
  "appointmentId": "<appointmentId>",
  "diagnosis": "Seasonal allergic rhinitis",
  "medicines": [{ "name": "Cetirizine", "dosage": "10mg", "frequency": "once daily", "duration": "5 days" }],
  "notes": "Avoid dust exposure",
  "followUpDate": "2026-08-15",
  "treatmentCost": 300
}
```

---

## Admin Analytics — `/admin`

All routes require the `admin` role.

| Method | Path | Description |
|---|---|---|
| GET | `/admin/analytics/overview` | Total patients, doctors, appointments, status breakdown, cancellation rate, total revenue |
| GET | `/admin/analytics/department-performance` | Appointments per department (total/completed/cancelled) |
| GET | `/admin/analytics/doctor-utilization` | Appointments handled per doctor |
| GET | `/admin/analytics/patient-demographics` | Patients by city, gender, and age bucket |
| GET | `/admin/users` | List all user accounts. Query: `role` |
| PATCH | `/admin/users/:id/status` | Activate/deactivate a user account (`{ "isActive": false }`) |

---

## Error Codes

| Status | Meaning |
|---|---|
| 400 | Bad request (invalid state transition, business rule violation) |
| 401 | Not authenticated / invalid or expired token |
| 403 | Authenticated but not authorized for this resource |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, double-booked slot) |
| 422 | Validation failed (see `message` for field-level details) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

## Rate Limiting

- Auth endpoints (`/auth/register`, `/auth/login`): 20 requests / 15 minutes per IP.
- All `/api` routes: 500 requests / 15 minutes per IP.
