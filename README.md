# EduSync Student Management System

EduSync is a multi-portal school operations platform with a TypeScript backend, an admin console, and a principal-facing portal. This repository is organized to support day-to-day development, Firebase-backed authentication, and clean deployment to production environments.

## Active Applications

- `backend-ts/`: TypeScript Express API, Firebase Admin integration, core business endpoints.
- `frontend-admin/`: React + Vite admin console for platform operators.
- `frontend-principal/`: React + Vite portal for school principals.

## Legacy Folders

- `backend/` and `frontend/` are older iterations kept only as reference material.
- `_legacy_backup/` is not part of the active application stack.

## Local Ports

- Admin frontend: `http://localhost:3000`
- Principal frontend: `http://localhost:3001`
- Backend API: `http://localhost:4000`

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A Firebase project with Authentication, Firestore, and Storage enabled
- A Firebase service account for backend access

## Getting Started

1. Install root tooling:

```bash
npm install
```

2. Install dependencies for each active workspace:

```bash
cd backend-ts && npm install
cd ../frontend-admin && npm install
cd ../frontend-principal && npm install
```

3. Create environment files from the examples:

```bash
cd backend-ts && cp .env.example .env
cd ../frontend-admin && cp .env.example .env
cd ../frontend-principal && cp .env.example .env
```

4. Fill in the Firebase and API values in each `.env` file.

5. Start development:

```bash
npm run dev
```

This starts the backend and admin console together. If you also want the principal portal running, use:

```bash
npm run dev:full
```

## Root Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run `backend-ts` and `frontend-admin` together |
| `npm run dev:full` | Run backend, admin, and principal portals together |
| `npm run dev:principal` | Run only the principal portal |
| `npm run build` | Build all active applications |
| `npm run lint` | Run lint checks for the frontends |
| `npm run check` | Run linting and builds together |

## Environment Setup

### `backend-ts/.env`

Required values:

- `PORT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `CORS_ORIGIN`

Optional values:

- `RAZORPAY_KEY_SECRET`

### `frontend-admin/.env`

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_URL`

### `frontend-principal/.env`

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_URL`

## Professional Working Agreement

- Treat `backend-ts/`, `frontend-admin/`, and `frontend-principal/` as the source of truth.
- Do not commit `.env` files, `node_modules`, build outputs, or ad-hoc logs.
- Run `npm run check` before shipping major changes.
- Make changes in the active stack first; only touch legacy folders when deliberately migrating code.
- Keep Firebase rules and environment values aligned with the deployed environment.

## Deployment Notes

- Deploy `backend-ts` as the API service.
- Deploy `frontend-admin` and `frontend-principal` as separate static frontends.
- Set production CORS origins explicitly for every deployed frontend origin.
- Store Firebase service account credentials only in secure environment configuration.

## Next Recommended Improvements

- Add backend linting and test coverage.
- Introduce CI to run `npm run check` on every push.
- Convert remaining duplicated frontend logic into shared typed modules if both portals will evolve together.
