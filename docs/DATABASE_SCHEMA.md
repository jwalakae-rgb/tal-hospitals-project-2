# TALHospitals Database Schema

MongoDB with Mongoose ODM. Six collections, connected by ObjectId references (not embedded
documents) so each entity can be queried, paginated, and indexed independently.

## Entity Relationship Overview

```
User (1) ──── (1) Patient ──── (*) Appointment ──── (1) Doctor ──── (1) User
                    │                  │                   │
                    │                  │                   └── (1) Department
                    │                  │
                    └── (*) medicalReports (embedded)
                                       │
                                       └── (0..1) Prescription
```

- A `User` is the login identity (email/password/role). `Patient` and `Doctor` each hold a
  1:1 reference back to `User` for role-specific profile data — this keeps auth concerns
  separate from domain data.
- `Appointment` is the central join between a `Patient` and a `Doctor`, denormalizing
  `department` for fast filtering without an extra lookup.
- `Prescription` references the `Appointment` it was written for, plus direct `patient` and
  `doctor` references for simpler queries (e.g. "all prescriptions for patient X").

---

## `users`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `password` | String | required, bcrypt-hashed, `select: false` |
| `phone` | String | |
| `role` | String enum | `patient` \| `doctor` \| `admin`, default `patient` |
| `isActive` | Boolean | default `true` — deactivation instead of hard delete |
| `lastLogin` | Date | |
| `createdAt` / `updatedAt` | Date | timestamps |

**Indexes**: `email` (unique), `role`.

---

## `departments`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | required, unique |
| `description` | String | |
| `isActive` | Boolean | default `true` |

---

## `doctors`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `user` | ObjectId → `users` | required, unique (1:1) |
| `department` | ObjectId → `departments` | required |
| `specialization` | String | required |
| `experience` | Number | years, min 0 |
| `consultationFee` | Number | min 0 |
| `qualifications` | [String] | |
| `availability` | [{ day, startTime, endTime }] | embedded weekly slots |
| `isAvailableForBooking` | Boolean | default `true` |
| `bio` | String | max 1000 chars |

**Indexes**: `department`, `specialization`.

---

## `patients`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `user` | ObjectId → `users` | required, unique (1:1) |
| `age` | Number | 0–130 |
| `gender` | String enum | `male` \| `female` \| `other` |
| `city` | String | indexed for demographics queries |
| `address` | String | |
| `bloodGroup` | String enum | `A+`…`O-` \| `null` |
| `emergencyContact` | { name, phone } | embedded |
| `medicalReports` | [{ fileName, filePath, fileType, uploadedAt, description }] | embedded, one entry per upload |

**Indexes**: `city`.

---

## `appointments`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `patient` | ObjectId → `patients` | required |
| `doctor` | ObjectId → `doctors` | required |
| `department` | ObjectId → `departments` | required, denormalized from doctor at booking time |
| `appointmentDate` | Date | required |
| `timeSlot` | String | required, e.g. `"09:00-09:30"` |
| `consultationType` | String enum | `in-person` \| `video` \| `phone`, default `in-person` |
| `status` | String enum | `pending` \| `approved` \| `rejected` \| `completed` \| `cancelled` \| `rescheduled` |
| `reasonForVisit` | String | |
| `cancellationReason` | String | |
| `rescheduleHistory` | [{ previousDate, previousTimeSlot, changedAt }] | embedded audit trail |
| `consultationFee` | Number | snapshotted from doctor at booking time |

**Indexes**: `{ doctor: 1, appointmentDate: 1 }` (conflict checks), `patient`, `status`.

**Uniqueness rule** (enforced in application logic, not a DB constraint): no two active
(`pending`/`approved`/`rescheduled`) appointments may share the same `doctor` + `appointmentDate`
+ `timeSlot`.

---

## `prescriptions`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `appointment` | ObjectId → `appointments` | required, one prescription per appointment |
| `patient` | ObjectId → `patients` | required |
| `doctor` | ObjectId → `doctors` | required |
| `diagnosis` | String | required |
| `medicines` | [{ name, dosage, frequency, duration }] | embedded |
| `notes` | String | |
| `followUpDate` | Date | |
| `treatmentCost` | Number | min 0, default 0 |

**Indexes**: `patient`, `doctor`.

---

## Design Decisions

- **Referenced, not embedded, patients/doctors/appointments** — these grow independently and
  need their own pagination/search, so embedding would bloat parent documents and duplicate data.
- **Embedded sub-documents** (`medicalReports`, `availability`, `rescheduleHistory`, `medicines`,
  `emergencyContact`) — these are always accessed together with their parent and have no
  independent lifecycle, so embedding avoids extra round-trips.
- **Soft deletes** (`isActive` flags) instead of hard deletes — preserves appointment/prescription
  history even if a doctor or department is retired.
- **Denormalized `department` on `Appointment`** — lets admin analytics aggregate by department
  without an extra `$lookup` through `doctors` on every query.
