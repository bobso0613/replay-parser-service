import express from "express";
import multer from "multer";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseReplayFile } from "../services/parser.service.js";
import type { IReplayData } from "../types/replay-api.js";

const uploadDirectory = path.join(os.tmpdir(), "uploads");

await fs.mkdir(uploadDirectory, { recursive: true });

const upload = multer({
  dest: uploadDirectory,
});

const parserRouter = express.Router();

parserRouter.post("/parse", upload.single("replay"), async (req, res, next) => {
  if (!req.file) {
    res
      .status(400)
      .json({ error: "Missing replay file in the 'replay' field." });
    return;
  }

  try {
    const result: IReplayData = await parseReplayFile(req.file.path);
    res.type("json").send(JSON.stringify(result));
  } catch (error) {
    next(error);
  }
});

export default parserRouter;
