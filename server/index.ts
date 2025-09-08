import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  // Server-Sent Events endpoint
  // Use static import to avoid top-level await in non-async context
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { handleSSE } = require("./routes/sse");
  app.get("/api/sse", handleSSE);

  return app;
}
