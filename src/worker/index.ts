import { Hono } from "hono";
import { healthPayload } from "../shared/health.mjs";

type WorkerBindings = {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
};

const app = new Hono<{ Bindings: WorkerBindings }>();

app.get("/api/health", (context) => context.json(healthPayload()));
app.get("/api/", (context) => context.json({
  service: "nextaction-worker",
  status: "ok",
  health: "/api/health",
}));

export default app;
