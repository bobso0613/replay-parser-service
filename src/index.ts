import fs from "node:fs/promises";
import https from "node:https";
import http from "node:http";
import path from "node:path";
import dotenv from "dotenv";
import selfsigned from "selfsigned";
import { app } from "./app.js";

const workingDirectory = process.cwd();
const lifecycleEvent = process.env.npm_lifecycle_event;

dotenv.config({ path: path.join(workingDirectory, ".env") });

if (lifecycleEvent !== "dev") {
  dotenv.config({
    path: path.join(workingDirectory, ".env.production"),
    override: true,
  });
}

const port = Number(process.env.PORT ?? 3000);
const httpsKeyFile =
  process.env.HTTPS_KEY_FILE ?? path.join(workingDirectory, "private.key");
const httpsCertFile =
  process.env.HTTPS_CERT_FILE ??
  path.join(workingDirectory, "certificate.cert");
const isDevMode =
  process.env.NODE_ENV === "development" || lifecycleEvent === "dev";

const createLocalCertificate = async () => {
  return await selfsigned.generate(
    [
      {
        name: "commonName",
        value: "localhost",
      },
    ],
    {
      algorithm: "sha256",
      notBeforeDate: new Date(),
      notAfterDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      extensions: [
        {
          name: "subjectAltName",
          altNames: [
            {
              type: 2,
              value: "localhost",
            },
            {
              type: 7,
              ip: "127.0.0.1",
            },
          ],
        },
      ],
    },
  );
};

const startServer = async (): Promise<void> => {
  if (!isDevMode) {
    http.createServer(app).listen(port, "127.0.0.1", () => {
      console.log(
        `Replay parser service listening on http://127.0.0.1:${port}`,
      );
    });
    return;
  }

  const hasExplicitTlsEnv =
    Boolean(process.env.HTTPS_KEY_FILE) || Boolean(process.env.HTTPS_CERT_FILE);

  let tlsOptions: { key: Buffer | string; cert: Buffer | string };

  try {
    tlsOptions = {
      key: await fs.readFile(httpsKeyFile),
      cert: await fs.readFile(httpsCertFile),
    };
    console.log(
      `Using TLS certificate files: key=${httpsKeyFile}, cert=${httpsCertFile}`,
    );
  } catch (error) {
    if (hasExplicitTlsEnv) {
      throw error;
    }

    const certificate = await createLocalCertificate();
    tlsOptions = {
      key: certificate.private,
      cert: certificate.cert,
    };
    console.log(
      `TLS files not found in ${workingDirectory}. Falling back to generated localhost certificate.`,
    );
  }

  https.createServer(tlsOptions, app).listen(port, () => {
    console.log(`Replay parser service listening on https://localhost:${port}`);
  });
};

void startServer();
