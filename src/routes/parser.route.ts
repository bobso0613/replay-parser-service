import express from "express";
import multer from "multer";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseReplayFile } from "../services/parser.service.js";
import {
  createPersistedOutputId,
  deletePersistedOutputArtifacts,
  readPersistedOutput,
  savePersistedOutput,
} from "../services/persisted-output.service.js";

const uploadDirectory = path.join(os.tmpdir(), "uploads");

await fs.mkdir(uploadDirectory, { recursive: true });

const upload = multer({
  dest: uploadDirectory,
});

const parserRouter = express.Router();
const requiredReplayExtension = ".rrf";
const outputIdPattern = /^[a-f0-9]{24}$/;

parserRouter.get("/parse/:outputId", async (req, res, next) => {
  const outputId = req.params.outputId;
  res.locals.fileName = `persisted:${outputId}`;

  if (!outputIdPattern.test(outputId)) {
    const message = "Invalid persisted output ID format.";
    res.locals.errorMessage = message;
    res.status(400).json({ error: message, requestId: res.locals.requestId });
    return;
  }

  try {
    const persistedOutput = await readPersistedOutput(outputId);

    if (persistedOutput === null) {
      const message = "Persisted output not found for the requested ID.";
      res.locals.errorMessage = message;
      res.status(404).json({ error: message, requestId: res.locals.requestId });
      return;
    }

    const outputPath = `/parse/${outputId}`;
    const outputLink = `${req.protocol}://${req.get("host")}${outputPath}`;

    res.status(200).json({
      requestId: res.locals.requestId,
      replayFileName: persistedOutput.replayFileName,
      outputId,
      outputLink,
      outputPath,
      outputRaw: persistedOutput.outputRaw,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.locals.errorMessage = error.message;
    }
    next(error);
  }
});

parserRouter.post("/parse", upload.single("replay"), async (req, res, next) => {
  res.locals.fileName = req.file?.originalname ?? "N/A";

  if (!req.file) {
    const message = "Missing replay file in the 'replay' field.";
    res.locals.errorMessage = message;
    res.status(400).json({ error: message, requestId: res.locals.requestId });
    return;
  }

  const uploadedExtension = path.extname(req.file.originalname).toLowerCase();
  if (uploadedExtension !== requiredReplayExtension) {
    const message = `Invalid file type. Only ${requiredReplayExtension} files are allowed.`;
    res.locals.errorMessage = message;
    await fs.rm(req.file.path, { force: true });
    res.status(400).json({ error: message, requestId: res.locals.requestId });
    return;
  }

  try {
    const outputId = createPersistedOutputId();
    res.locals.outputId = outputId;
    const rawJson = await parseReplayFile(req.file.path);
    await savePersistedOutput(outputId, req.file.originalname, rawJson);

    const outputPath = `/parse/${outputId}`;
    const outputLink = `${req.protocol}://${req.get("host")}${outputPath}`;

    res.status(201).json({
      requestId: res.locals.requestId,
      replayFileName: req.file.originalname,
      outputId,
      outputLink,
      outputPath,
      outputRaw: rawJson,
    });
  } catch (error) {
    const outputId =
      typeof res.locals.outputId === "string" ? res.locals.outputId : undefined;

    if (outputId) {
      try {
        await deletePersistedOutputArtifacts(outputId);
      } catch (cleanupError) {
        console.error("Failed to clean persisted artifacts", cleanupError);
      }
    }

    if (error instanceof Error) {
      res.locals.errorMessage = error.message;
    }
    next(error);
  }
});

export default parserRouter;
