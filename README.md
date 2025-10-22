# SpennyBucketTracker

Instructions to run the project locally (updated).

## Install dependencies

From repo root:

```bash
npm ci
```

## Run in development (server + client with HMR)

This starts the Express server and Vite middleware so both API and client are served together. The server reads `PORT` from the environment and defaults to `5000`.

Default (may conflict with system services on macOS):

```bash
npm run dev
# open http://localhost:5000
```

Recommended — use a free port (e.g. 5173) to avoid conflicts:

```bash
# bash/mac
export PORT=5173
npm run dev
# open http://localhost:5173
```

Notes for dev troubleshooting:

- If you see `ENOTSUP` when binding a port, the server will retry without `reusePort` (we handle this in `server/index.ts`).
- If you see `EADDRINUSE`, another process is using the port. Use `lsof -i :<port>` to find and stop it, or pick a different `PORT`.

## Build and run production

Build the client and bundle the server:

```bash
npm run build
```

Start the compiled server (defaults to port 5000):

```bash
npm start
# open http://localhost:5000
```

If `5000` is occupied (common on some macOS setups), run on a different port:

```bash
export PORT=5173
npm start
# open http://localhost:5173
```

Production notes:

- Built client files are written to `dist/public` (see `vite.config.ts`).
- `npm start` runs the bundled `dist/index.js` server which serves API routes and static files.

## Client-only dev (Vite)

If you only need the frontend without the Express server, run Vite directly from the `client` folder:

```bash
cd client
npx vite
# open http://localhost:5173 (default Vite port)
```

## Quick troubleshooting commands

- Check what process is using a port:

```bash
lsof -i :5000
lsof -i :5173
```

- Kill the process listening on a port (use carefully):

```bash
lsof -ti :5173 | xargs -r kill    # graceful
lsof -ti :5173 | xargs -r kill -9 # force
```

- Check local git config (commit author):

```bash
git config user.name
git config user.email
```

If you want, I can add a short `scripts` section to the README that includes a `dev:port` helper script, or help you set up `pm2`/`systemd` for production.
