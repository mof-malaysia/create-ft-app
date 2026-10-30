import { randomUUID } from "node:crypto";
// @if web
import { existsSync } from "node:fs";
// @endif
import cors from "@fastify/cors";
// @if web
import fastifyStatic from "@fastify/static";
// @endif
import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import Fastify, { type FastifyServerOptions } from "fastify";
// @if postgres
import type { Db } from "./db/index.js";
// @endif
import type { Env } from "./env.js";
import { errorHandler, notFoundHandler } from "./errors.js";
import { healthRoutes } from "./routes/health.js";
import { helloRoutes } from "./routes/hello.js";
import { openApiTransform, useValibot } from "./validation.js";

export type AppOptions = {
  env: Env;
  // @if postgres
  /** Left out by tests that don't touch the database. */
  db?: Db;
  // @endif
};

function logger(env: Env): FastifyServerOptions["logger"] {
  if (env.NODE_ENV !== "development") return { level: env.LOG_LEVEL };
  return {
    level: env.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
    },
  };
}

export async function buildApp(options: AppOptions) {
  const { env } = options;
  const app = Fastify({
    logger: logger(env),
    requestIdHeader: "x-request-id",
    genReqId: () => randomUUID(),
  });

  useValibot(app);
  app.setErrorHandler(errorHandler);
  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });
  // @if postgres
  const { db } = options;
  if (db) app.addHook("onClose", () => db.destroy());
  // @endif

  if (env.CORS_ORIGIN)
    await app.register(cors, {
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
    });

  await app.register(swagger, {
    openapi: { info: { title: "{{title}} API", version: "0.0.0" } },
    transform: openApiTransform,
  });

  // @if postgres
  await app.register(healthRoutes, { db });
  // @else
  await app.register(healthRoutes);
  // @endif
  await app.register(helloRoutes, { prefix: "/v1" });

  app.get("/openapi.json", { schema: { hide: true } }, async () =>
    app.swagger(),
  );
  await app.register(scalar, {
    routePrefix: "/docs",
    configuration: { url: "/openapi.json" },
  });

  // @if web
  // In the Docker image the api also serves the SPA, so the app is one origin.
  if (env.WEB_DIST && existsSync(env.WEB_DIST)) {
    await app.register(fastifyStatic, {
      root: env.WEB_DIST,
      // Rsbuild fingerprints everything under static/; index.html must revalidate.
      setHeaders: (reply, path) =>
        reply.header(
          "cache-control",
          path.includes("/static/")
            ? "public, max-age=31536000, immutable"
            : "no-cache",
        ),
    });
    app.setNotFoundHandler((request, reply) => {
      const wantsPage =
        request.method === "GET" &&
        !request.url.startsWith("/v1/") &&
        request.headers.accept?.includes("text/html");
      return wantsPage
        ? reply.sendFile("index.html")
        : notFoundHandler(request, reply);
    });
  } else {
    app.setNotFoundHandler(notFoundHandler);
  }
  // @else
  app.setNotFoundHandler(notFoundHandler);
  // @endif

  return app;
}
