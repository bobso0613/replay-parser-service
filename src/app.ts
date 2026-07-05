import express from "express";
import cors from "cors";
import parserRouter from "./routes/parser.route.js";

export const app = express();

const allowedOrigin = process.env.CORS_ORIGIN ?? "https://localhost:8443";

app.use(
  cors({
    origin: allowedOrigin,
  }),
);

app.options(
  "*",
  cors({
    origin: allowedOrigin,
  }),
);

app.use(parserRouter);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const message =
      error instanceof Error ? error.message : "Failed to parse replay.";
    console.error(error);
    res.status(500).json({ error: message });
  },
);
