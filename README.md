# Replay Parser Service 🚀

TypeScript + Express API that accepts an uploaded replay file, runs the replay parser executable, stores `output.json` with replay filename metadata, and serves data by a random output ID.

## Project Layout 🧱

```text
src/
├── routes/
│   └── parser.route.ts
├── services/
│   ├── parser.service.ts
│   └── persisted-output.service.ts
├── utils/
│   ├── process.ts
│   └── request-logger.ts
└── temp/
```

## Environment ⚙️

- `PORT` - HTTPS server port, defaults to `3000`
- `PARSER_EXE` - parser `.exe` path, defaults to `src/parser/RagnarokReplayExample.exe`
- `WINE_BIN` - Wine binary used on non-Windows hosts for `.exe` execution, defaults to `wine`
- `CORS_ORIGIN` - allowed frontend origin, defaults to `https://localhost:8443`
- `HTTPS_KEY_FILE` - optional TLS private key path
- `HTTPS_CERT_FILE` - optional TLS certificate path
- `OUTPUT_STORAGE_DIR` - storage directory for persisted outputs + metadata, defaults to `persisted-output`

HTTPS behavior 🔐:

- If `HTTPS_KEY_FILE` and `HTTPS_CERT_FILE` are set, those are used.
- Otherwise, a self-signed localhost certificate is generated at startup.

## API Endpoints 📡

### `POST /parse` 📤

Form-data 📎:

- `replay` - required `.rrf` file

Behavior 🛠️:

- Validates file extension is `.rrf`
- Runs parser as `RagnarokReplayExample.exe input.rrf output.json --minify-json` in a temp job directory
- Persists output JSON and replay filename metadata under a random `outputId`

Success response (`201`) ✅:

- `requestId`
- `replayFileName`
- `outputId`
- `outputLink`
- `outputPath`
- `outputRaw`

### `GET /parse/:outputId` 📥

Behavior 🔎:

- Validates `outputId` format
- Returns previously persisted output + metadata without re-uploading `.rrf`

Success response (`200`) ✅:

- `requestId`
- `replayFileName`
- `outputId`
- `outputLink`
- `outputPath`
- `outputRaw`

Error responses include `requestId` ⚠️.

## Persistence 💾

Persisted artifacts are stored under `OUTPUT_STORAGE_DIR` 📁:

- `outputs/<outputId>.json` - parser output payload
- `metadata/<outputId>.json` - replay filename and timestamp metadata

Note: the uploaded `.rrf` file itself is not persisted 🧹.

## Logging 🧾

Access logs are written to `logs/access-log.txt` for all requests (including invalid routes), with fields 🧠:

- `requestId`
- `timestamp`
- `ip`
- `client_ip` (from `X-Client-IP` header)
- `route`
- `filename`
- `outcome` (`success` or `fail`)
- `error`

## Examples 🧪

```bash
curl -k -F "replay=@./sample.rrf" https://localhost:3000/parse

curl -k https://localhost:3000/parse/9b8a41f4f42dc816ad841d08
```

## Scripts ▶️

- `npm run dev` - start in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run the compiled server
