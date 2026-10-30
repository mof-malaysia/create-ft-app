# {{name}}: one image, built from the whole workspace.
#   docker build -t {{name}} .
# @if api
#   docker run -p 3000:3000 --env-file apps/api/.env {{name}}
# @else
#   docker run -p 8080:8080 {{name}}
# @endif

FROM node:{{nodeMajor}}-slim AS base
RUN npm install --global pnpm@{{pnpmVersion}}
WORKDIR /app

# ---- install + build ------------------------------------------------------
FROM base AS build
# Download dependencies from the lockfile alone, so this layer survives
# source changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm fetch --store-dir /pnpm/store
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline --store-dir /pnpm/store
RUN pnpm run build
# @if api

# The api with only its production dependencies, workspace packages included.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter {{scope}}/api deploy --prod --legacy --store-dir /pnpm/store /out/api

# ---- runtime --------------------------------------------------------------
FROM node:{{nodeMajor}}-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=build /out/api ./
# @if web
# The api serves the built SPA, so the image is one origin.
COPY --from=build /app/apps/web/dist ./public
ENV WEB_DIST=/app/public
# @endif
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
# @else

# ---- runtime: static files behind nginx -----------------------------------
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
# @endif
