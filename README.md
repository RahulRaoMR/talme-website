# TALME Website

React/Vite frontend with a small Node/Vercel backend for contact forms, career applications, chat messages, and news updates.

## Development

```bash
npm install
npm run dev
```

`npm run dev` starts:

- Vite on `http://localhost:5173`
- Backend API on `http://localhost:3001`

The Vite dev server proxies `/api/*` to the backend.

## Backend Routes

- `POST /api/contact` stores and/or emails contact form submissions.
- `POST /api/careers` stores and/or emails career applications with PDF resumes.
- `POST /api/chat` stores chat widget messages.
- `GET /api/site-data` returns stored contact, career, and chat submissions. Requires `x-admin-key`.
- `GET /api/news` returns news items.
- `POST /api/news` creates a news item. Requires `x-admin-key`.
- `PUT /api/news?id=<id>` updates a news item. Requires `x-admin-key`.
- `DELETE /api/news?id=<id>` deletes a news item. Requires `x-admin-key`.

## Environment

Copy `.env.example` to `.env` for local development and set the values you need.

Important variables:

- `BACKEND_PORT`: local backend port, default `3001`.
- `SITE_ADMIN_KEY`: admin key for reading `/api/site-data`.
- `NEWS_ADMIN_KEY`: admin key for managing news. The news API also accepts `SITE_ADMIN_KEY`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP email delivery.
- `CONTACT_EMAIL_TO`, `CAREERS_EMAIL_TO`: recipients for website submissions.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: persistent storage for production/serverless deployments.

Without Redis/KV, local development stores data in `server/website-storage.json` and `server/news-storage.json`. On serverless hosting, configure Redis/KV so submissions and news edits persist.
