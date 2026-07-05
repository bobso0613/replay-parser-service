import fs from "node:fs/promises";
import https from "node:https";
import selfsigned from "selfsigned";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const httpsKeyFile = process.env.HTTPS_KEY_FILE;
const httpsCertFile = process.env.HTTPS_CERT_FILE;

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
  const tlsOptions =
    httpsKeyFile && httpsCertFile
      ? {
          key: await fs.readFile(httpsKeyFile),
          cert: await fs.readFile(httpsCertFile),
        }
      : ((certificate) => ({
          key: certificate.private,
          cert: certificate.cert,
        }))(await createLocalCertificate());

  https.createServer(tlsOptions, app).listen(port, () => {
    console.log(`Replay parser service listening on https://localhost:${port}`);
  });
};

void startServer();
