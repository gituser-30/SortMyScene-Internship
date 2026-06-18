# SortMyScene — Ticket Booking System

## Tech Stack
**Frontend:** React 18, Vite, React Router v6, Axios, Tailwind CSS
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT

## How to Run

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
node utils/seedData.js # seed sample events
npm run dev            # starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev            # starts on port 5173
```

## Assumptions
- MongoDB is running locally (or Atlas URI provided in .env).
- For atomic transactions, MongoDB must run as a replica set. If it is a standalone instance, the backend gracefully falls back to a bulkWrite strategy.
- `userId` is derived securely from the JWT token attached to requests — no separate `userId` input is required from the frontend.
- Seat data is pre-seeded via `seedData.js`; there is no admin UI for creating events dynamically in this version.

## Design Decisions: Preventing Double Booking

1. **Atomic findOneAndUpdate with `{ status: "available" }` filter** — ensures a seat can only be reserved if it is STILL available at the moment of the DB write, not just when the user selected it on the frontend.
2. **MongoDB transactions (startSession/startTransaction)** — wrap all seat updates and the reservation creation so either ALL succeed or ALL roll back, eliminating the risk of partial reservations.
3. **Fallback Strategy (Non-Replica Set)** — uses `updateMany` (bulk) with a `modifiedCount` check. If fewer seats were updated than requested, all modified seats are immediately rolled back to "available".
4. **TTL & Expiration Checks** — the `expiresAt` field combined with a manual check in `/api/bookings` ensures that expired reservations can never be confirmed, preventing race conditions around expiration.
5. **Frontend State Syncing** — the frontend explicitly re-fetches seat state immediately after any reservation errors to ensure the UI represents the current ground truth.
