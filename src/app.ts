import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import parserRouter from "./routes/parser.route.js";
import { logAccessEntry } from "./utils/request-logger.js";

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

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const startedAt = new Date().toISOString();

  res.on("finish", () => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0];
    const headerClientIp = req.headers["x-client-ip"];
    const clientIp = Array.isArray(headerClientIp)
      ? headerClientIp[0]
      : headerClientIp;
    const ipAddress = (
      forwardedIp ??
      req.ip ??
      req.socket.remoteAddress ??
      "unknown"
    ).trim();
    const route = `${req.method} ${req.originalUrl}`;
    const currentRequestId =
      typeof res.locals.requestId === "string" &&
      res.locals.requestId.length > 0
        ? res.locals.requestId
        : requestId;
    const fileName =
      typeof res.locals.fileName === "string" && res.locals.fileName.length > 0
        ? res.locals.fileName
        : "N/A";
    const outcome = res.statusCode >= 400 ? "fail" : "success";
    const errorMessage =
      typeof res.locals.errorMessage === "string" &&
      res.locals.errorMessage.length > 0
        ? res.locals.errorMessage
        : "N/A";

    void logAccessEntry({
      requestId: currentRequestId,
      ip: ipAddress,
      clientIp: (clientIp ?? "N/A").trim(),
      timestamp: startedAt,
      route,
      fileName,
      outcome,
      errorMessage,
    }).catch((error) => {
      console.error("Failed to write access log", error);
    });
  });

  next();
});

app.use(parserRouter);

app.use((req, res) => {
  const message = "Route not found.";
  res.locals.errorMessage = message;
  res.status(404).json({ error: message, requestId: res.locals.requestId });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const message =
      error instanceof Error ? error.message : "Failed to parse replay.";
    res.locals.errorMessage = message;
    console.error(error);
    res.status(500).json({ error: message, requestId: res.locals.requestId });
  },
);
