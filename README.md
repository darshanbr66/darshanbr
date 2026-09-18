# Darshan B R — Portfolio

A premium, animated MERN-stack portfolio. React + Vite frontend with a custom cursor,
Three.js hero scene, scroll-driven animation and a cinematic project showcase, backed
by an Express + MongoDB API.

## Structure

```
client/   React + Vite frontend
server/   Node + Express + MongoDB API
```

## Running locally

### 1. Backend

```bash
cd server
cp .env.example .env   # then fill in MONGODB_URI (local Mongo or MongoDB Atlas)
npm install
npm run seed            # populate projects / skills / experience
npm run dev              # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env    # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev              # starts on http://localhost:5173
```

The frontend works even if the backend/database isn't running — every section
falls back to the static data in `client/src/data/` automatically
(`useFetchWithFallback`), so the experience is never blank.

## Editing content

- **Profile / bio**: `client/src/data/profile.js`
- **Experience**: `client/src/data/experience.js` (mirrored in `server/seed/seed.js`)
- **Skills**: `client/src/data/skills.js` (mirrored in `server/seed/seed.js`)
- **Projects**: `client/src/data/projects.js` (mirrored in `server/seed/seed.js`)

To update live data, edit the seed file and re-run `npm run seed` in `server/`.

## API

| Method | Route                | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/projects`       | All projects             |
| GET    | `/api/projects/:slug` | Single project           |
| GET    | `/api/skills`         | Skill categories         |
| GET    | `/api/experience`     | Work experience          |
| POST   | `/api/contact`        | Submit contact message   |

## Build

```bash
cd client && npm run build
```
