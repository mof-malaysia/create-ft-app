import type { FastifyPluginAsync } from "fastify";
// @if postgres
import { sql } from "kysely";
// @endif
import * as v from "valibot";
// @if postgres
import type { Db } from "../db/index.js";
// @endif

const Health = v.object({ ok: v.boolean() });

// @if postgres
/** Ready check for load balancers: 200 when the api and its database answer. */
export const healthRoutes: FastifyPluginAsync<{ db?: Db }> = async (app, { db }) => {
// @else
/** Ready check for load balancers. */
export const healthRoutes: FastifyPluginAsync = async (app) => {
// @endif
  app.get(
    "/healthz",
    {
      schema: {
        summary: "Ready check",
        tags: ["health"],
        // @if postgres
        response: { 200: Health, 503: Health },
        // @else
        response: { 200: Health },
        // @endif
      },
    },
    // @if postgres
    async (request, reply) => {
      if (db) {
        try {
          await sql`select 1`.execute(db);
        } catch (error) {
          request.log.error({ err: error }, "database unreachable");
          return reply.status(503).send({ ok: false });
        }
      }
      return { ok: true };
    },
    // @else
    async () => ({ ok: true }),
    // @endif
  );
};
