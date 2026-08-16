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

/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         requestId:
 *           type: string
 *     ParseResult:
 *       type: object
 *       properties:
 *         requestId:
 *           type: string
 *         replayFileName:
 *           type: string
 *         outputId:
 *           type: string
 *           pattern: "^[a-f0-9]{24}$"
 *         outputLink:
 *           type: string
 *           format: uri
 *         outputPath:
 *           type: string
 *         outputRaw:
 *           type: object
 *           description: Parsed replay data (see IReplayData).
 */

const uploadDirectory = path.join(os.tmpdir(), "uploads");

await fs.mkdir(uploadDirectory, { recursive: true });

const upload = multer({
  dest: uploadDirectory,
});

const parserRouter = express.Router();
const requiredReplayExtension = ".rrf";
const outputIdPattern = /^[a-f0-9]{24}$/;

/**
 * @openapi
 * /parse/{outputId}:
 *   get:
 *     summary: Retrieve a previously parsed replay output
 *     tags: [Parser]
 *     parameters:
 *       - in: path
 *         name: outputId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-f0-9]{24}$"
 *         description: 24-character hex ID returned when the replay was originally parsed.
 *     responses:
 *       200:
 *         description: Persisted parse output found and returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParseResult'
 *       400:
 *         description: The outputId is not a valid 24-character hex string.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No persisted output exists for the given outputId.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @openapi
 * /parse:
 *   post:
 *     summary: Upload a replay file and parse it
 *     tags: [Parser]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [replay]
 *             properties:
 *               replay:
 *                 type: string
 *                 format: binary
 *                 description: Ragnarok Online replay file (.rrf extension required).
 *     responses:
 *       201:
 *         description: Replay parsed and persisted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParseResult'
 *       400:
 *         description: Missing replay file or invalid file extension.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to parse the uploaded replay file.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
