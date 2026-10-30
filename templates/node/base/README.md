# {{title}}

<!-- @if fullstack -->
A React SPA and a Fastify api in one Turborepo monorepo.
<!-- @elif api -->
A Fastify api in a Turborepo monorepo.
<!-- @elif web -->
A React SPA in a Turborepo monorepo.
<!-- @else -->
A Turborepo monorepo.
<!-- @endif -->

## Getting started

```sh
pnpm install
<!-- @if postgres -->
docker compose up -d db
<!-- @endif -->
pnpm dev
```

<!-- @if fullstack -->
- Web: http://localhost:3001
- API: http://localhost:3000 (docs at http://localhost:3000/docs)
<!-- @elif api -->
- API: http://localhost:3000 (docs at http://localhost:3000/docs)
<!-- @elif web -->
- Web: http://localhost:3000
<!-- @endif -->

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run every app in watch mode |
| `pnpm build` | Build every package |
| `pnpm lint` | Oxlint |
| `pnpm check-types` | TypeScript, no emit |
| `pnpm test` | Rstest |
| `pnpm format` | Prettier |
| `pnpm verify` | Lint, type check, test and build: what CI runs |
<!-- @if api -->

## Configuration

The api reads environment variables, validated in `apps/api/src/env.ts`:

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | Port to listen on |
| `HOST` | `127.0.0.1` | Interface to bind (`0.0.0.0` in Docker) |
| `LOG_LEVEL` | `info` | Pino log level |
| `CORS_ORIGIN` | (none) | Comma-separated origins allowed to call the api from another origin |
<!-- @if postgres -->
| `DATABASE_URL` | (required) | Postgres connection string |
<!-- @endif -->
<!-- @if web -->
| `WEB_DIST` | (none) | Folder with the built SPA to serve; set in the Docker image |
<!-- @endif -->
<!-- @endif -->
<!-- @if docker -->

## Docker

```sh
docker build -t {{name}} .
<!-- @if api -->
docker run -p 3000:3000 --env-file apps/api/.env {{name}}
<!-- @else -->
docker run -p 8080:8080 {{name}}
<!-- @endif -->
```
<!-- @endif -->

---

Scaffolded with create-ft-app {{cliVersion}}. See `AGENTS.md` for conventions.
