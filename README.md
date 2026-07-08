# CodeDuel — Backend + Frontend

CodeDuel is a full-stack competitive coding app (Express + Socket.io backend, React + Vite frontend).

Quick links

- Deployment instructions: see [DEPLOYMENT.md](DEPLOYMENT.md)
- Frontend: `frontend/` (Vite + React)
- Admin panel: `admin-panel/` (optional)

Deployment (short)

1. Set production environment variables (see `.env.example`).
2. Build the frontend:

```bash
cd frontend
npm ci
npm run build
```

3a. Serve frontend separately (Vercel/Netlify): deploy `frontend/dist`. Set `VITE_API_BASE` and `VITE_SOCKET_URL` to your backend URL.

3b. Or serve frontend from backend: from repo root run:

```bash
npm ci
npm run build   # builds frontend
NODE_ENV=production PORT=5000 node index.js
```

See `DEPLOYMENT.md` for the full step-by-step guide and provider-specific recommendations.
