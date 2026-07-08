Deployment Guide — CodeDuel

Overview

This project is a full-stack app with:
- Backend: Express + Socket.io + MongoDB (root `index.js`)
- Frontend: Vite + React (`/frontend`)
- Admin panel (optional) in `/admin-panel`

Two recommended deployment approaches are provided below.

1) Separate deployments (recommended)

- Backend: deploy the Node/Express app to a platform like Render, Railway, Fly.io or Heroku.
- Frontend: deploy the `frontend/dist` static build to Vercel, Netlify, or Cloudflare Pages.

Steps (separate):

1. Prepare production environment variables on the host (see list below).
2. Build the frontend locally or in CI:

```bash
cd frontend
npm ci
npm run build
```

3. Deploy `frontend/dist` to Vercel/Netlify/Cloudflare Pages (follow provider docs).
4. On the backend host, set environment variables and start the server:

```bash
# from repo root on the server (or use PM2/systemd)
npm ci
npm run build     # this runs frontend build (configured in root package.json)
NODE_ENV=production PORT=5000 node index.js
```

5. Configure OAuth callback URLs in Google/GitHub to point to your backend domain:

- Google: `${BACKEND_URL}/api/auth/google/callback`
- GitHub: `${BACKEND_URL}/api/auth/github/callback`

6. Configure frontend to use your API and socket URLs by setting Vite env vars (if deploying frontend separately):
- `VITE_API_BASE` → `https://api.yourdomain.com/api`
- `VITE_SOCKET_URL` → `https://api.yourdomain.com`


2) Single-host deployment (serve frontend from backend)

- Build the frontend and let Express serve `frontend/dist`.

Steps (single host):

1. On the server, clone repo and install:

```bash
git clone <repo>
cd codeduel-backend
npm ci
cd frontend
npm ci
npm run build
cd ..
npm run start
```

2. The backend `index.js` serves `frontend/dist` and exposes API under `/api`.
3. Set environment variables on the host (see list below).
4. Ensure your reverse proxy or host (Render, Fly, etc.) is configured to forward HTTP(S) ports.


Required environment variables (examples)

Create environment variables in your hosting dashboard or a `.env` file (DO NOT commit secrets):

- `MONGO_URI`=mongodb+srv://...   # MongoDB Atlas connection string
- `JWT_SECRET`=super_secret_key
- `JWT_EXPIRES_IN`=7d
- `JUDGE0_URL`=https://judge0-ce.p.rapidapi.com
- `JUDGE0_API_KEY`=your_rapidapi_key
- `BACKEND_URL`=https://api.yourdomain.com
- `FRONTEND_URL`=https://www.yourdomain.com
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (optional)

Vite frontend env variables (when building frontend separately)

- `VITE_API_BASE` (e.g. `https://api.yourdomain.com/api`)
- `VITE_BACKEND_URL` (e.g. `https://api.yourdomain.com`)
- `VITE_SOCKET_URL` (e.g. `https://api.yourdomain.com`)

Security notes

- Never commit secrets. Use your host's secure env var settings.
- Rotate the `JWT_SECRET` and API keys if they were exposed.

Troubleshooting

- Large bundle warnings: consider code-splitting dynamic imports.
- OAuth callback errors: check `BACKEND_URL` and `FRONTEND_URL` values match provider config.
- Socket.io issues: ensure `VITE_SOCKET_URL` matches backend and correct CORS is configured.

Support

If you want, I can produce a provider-specific guide (Render / Railway / Vercel) and the exact commands to create services and set env vars on that platform.