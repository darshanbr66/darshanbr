# Darshan B R — Portfolio + Admin CMS

A cinematic MERN portfolio (Three.js hero, custom cursor, Lenis smooth scroll,
scroll-driven project showcase) with a private Admin CMS. **All content lives in
MongoDB** and is edited at `/admin` — no code changes are needed to update the site.

```
MongoDB Atlas ── Express API (server/) ──┬── Public portfolio  (client/, /)
                                         └── Admin CMS         (client/src/admin, /admin)
```

## Running locally

```bash
# 1. API
cd server
cp .env.example .env      # set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, JWT_SECRET
npm install
npm run migrate            # one-time, idempotent: brings existing data into the CMS schema
npm run dev                # http://localhost:5000

# 2. Client
cd client
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

Open the site, scroll to the very bottom of the footer and click **Admin**
(or go to `/admin/login`).

## Admin CMS

| Section      | What it manages                                                                 |
|--------------|---------------------------------------------------------------------------------|
| Dashboard    | Counts, profile completion, resume status, recent messages, quick actions      |
| Profile      | Name, role, title, headline, description, location, email, availability, photo |
| About        | About heading, introduction, summary, background, focus, additional info       |
| Skills       | CRUD, categories, icon, featured, publish, ordering (Technology Universe)      |
| Experience   | CRUD, current role, dates, responsibilities, technologies, ordering             |
| Projects     | CRUD, search/filter, duplicate, publish/draft, featured, ordering, case study, main image + gallery |
| Media        | All uploads (GridFS); images are resized to ≤2000px and converted to WebP      |
| Resume       | Upload/replace PDF, view/download, previous versions with roll-back            |
| Messages     | Contact-form inbox: read/unread/replied, reply by email, delete                |
| Social Links | Links used by the contact section and footer                                    |
| Settings     | Hero copy, section headings/intros, account info                               |

### Credentials

Admin credentials are server-side environment variables only:

- `ADMIN_EMAIL` — login email
- `ADMIN_PASSWORD_HASH` — bcrypt hash; generate with `npm run hash-password -- "new password"`
- `JWT_SECRET` — long random string used to sign 12-hour admin sessions

Every create/update/delete endpoint verifies the JWT on the server; hiding the
admin URL is not relied upon. Login and contact submissions are rate limited.

## API

Public: `GET /api/site` (everything the site renders, one request), `GET /api/profile`,
`/api/content`, `/api/skills`, `/api/experience`, `/api/projects`, `/api/projects/:slug`,
`/api/resume`, `/api/resume/file` (always the active resume), `/api/media/:id`,
`POST /api/contact`.

Admin (Bearer token): `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/admin/stats`,
`PUT /api/profile`, `PUT /api/content`, CRUD + `PUT …/reorder` for
`/api/skills`, `/api/experience`, `/api/projects` (plus `POST /api/projects/:id/duplicate`),
`GET /api/contact/admin`, `PATCH|DELETE /api/contact/:id`, `GET|POST /api/media`,
`DELETE /api/media/:id`, `GET /api/resume/admin`, `POST /api/resume`,
`PUT /api/resume/:id/activate`, `DELETE /api/resume/:id`.

## Data & maintenance scripts (server/)

- `npm run backup` — exports every collection (except file chunks) to `server/backups/` (gitignored)
- `npm run migrate` — idempotent, non-destructive schema migration (each step runs once)
- `npm test` — API end-to-end tests; they create and remove their own records

## Deployment

Client on **Vercel**, API on **Render**, data on **MongoDB Atlas**.
Uploaded images and resumes live in MongoDB (GridFS), so nothing depends on the host's disk.

### API — Render (Web Service)

`render.yaml` (repo root) describes the service as a Blueprint; manual setup is equivalent:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Build Command | `npm ci --omit=dev` (or `npm install`) |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Environment: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD_HASH`, `CLIENT_URL=https://darshanbr.vercel.app` (and/or `CORS_ORIGIN`; both
accept comma-separated origins). Optional: `JWT_EXPIRES_IN`, `RESEND_API_KEY`,
`CONTACT_NOTIFICATION_EMAIL`. Render provides `PORT`; the server binds `0.0.0.0`.
MongoDB Atlas → Network Access must allow Render (`0.0.0.0/0` on the free tier, which has no static IPs).

The server starts listening immediately and retries MongoDB every 10 s if Atlas is unreachable
(`/api/health` reports `database`; data routes return 503 meanwhile).

### Client — Vercel

Root Directory `client`, framework Vite. Set `VITE_API_URL=https://<your-service>.onrender.com/api`
and redeploy (Vite inlines it at build time). `client/vercel.json` rewrites every route
(`/projects/:slug`, `/admin/*`) to the SPA.

`server/api/index.js` + `server/vercel.json` remain as an alternative serverless target
(request bodies are capped at ~4.5 MB there).
