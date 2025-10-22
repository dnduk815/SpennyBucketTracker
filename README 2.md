# SpennyBucketTracker

Instructions to run the project locally.

## Install dependencies

From repo root:

```bash
npm ci
```

## Run in development (server + client with HMR)

This starts the Express server and Vite middleware so both API and client are served together.

```bash
npm run dev
# open http://localhost:5000
```

To run on a different port:

```bash
# bash/mac
export PORT=5173
npm run dev
```

## Build and run production

```bash
npm run build
npm start
# open http://localhost:5000
```

## Client-only dev (Vite) — useful when you only need frontend

```bash
cd client
npx vite
# open http://localhost:5173 (default Vite port)
```

## Notes

- The production build output for the client is `dist/public` (see `vite.config.ts`).
- The `dev` script uses `tsx server/index.ts` (ensure `tsx` is installed as a devDependency).
