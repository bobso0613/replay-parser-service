# Replay Parser Service 🚀

TypeScript + Express API that accepts an uploaded replay file, runs the replay parser executable, enriches replay IDs with names from the preloaded databases, stores `output.json` with replay filename metadata, and serves data by a random output ID.

## Project Layout 🧱

```text
src/
├── docs/
│   └── swagger.ts
├── routes/
│   ├── parser.route.ts
│   └── parser.route.test.ts
├── services/
│   ├── database.service.ts
│   ├── database.service.test.ts
│   ├── parser.service.ts
│   ├── parser.service.test.ts
│   ├── persisted-output.service.ts
│   └── persisted-output.service.test.ts
├── utils/
│   ├── process.ts
│   ├── process.test.ts
│   ├── request-logger.ts
│   └── request-logger.test.ts
└── temp/
yaml/
├── item_db.yml
├── mob_db.yml
└── skill_db.yml
test/
└── app.test.ts
docs/
├── openapi.json
└── index.html
```

## Environment ⚙️

Environment variables are loaded with `dotenv`:

- `.env` is loaded for all runs.
- `.env.production` overrides values for non-dev runs.

- `PORT` - HTTPS server port, defaults to `3000`
- `PARSER_EXE` - parser `.exe` path, defaults to `src/parser/RagnarokReplayExample.exe`
- `MONO_BIN` - Mono binary used on non-Windows hosts for `.exe` execution, defaults to `mono`
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
- Adds `jobName`, `skillName`, `itemName`, and `monsterName` values using the preloaded YAML databases

Success response (`201`) ✅:

- `requestId`
- `replayFileName`
- `outputId`
- `outputLink`
- `outputPath`
- `outputRaw`

`outputRaw` contains the parsed replay JSON. Objects with an ID also include the corresponding display value:

- `jobId` -> `jobName` from `JOB_LIST`
- `skillId` -> `skillName` from the skill YAML `Description`
- `itemId` -> `itemName` from the item YAML `Name`
- `monsterId` -> `monsterName` from the mob YAML `Name`

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

The same enrichment is applied to data retrieved from persisted output files.

Error responses include `requestId` ⚠️.

## API Documentation (Swagger) 📚

The API is documented with the OpenAPI 3.0 spec, generated from JSDoc comments in [src/routes/parser.route.ts](src/routes/parser.route.ts) via `swagger-jsdoc`.

- Live interactive docs (Swagger UI): `GET /api-docs` while the server is running
- Raw OpenAPI JSON: `GET /api-docs.json`
- Static, offline-viewable docs: [docs/index.html](docs/index.html) and [docs/openapi.json](docs/openapi.json), regenerated with:

```bash
npm run docs:generate
```

This also runs automatically as part of `npm run build`.

## Persistence 💾

Persisted artifacts are stored under `OUTPUT_STORAGE_DIR` 📁:

- `outputs/<outputId>.json` - parser output payload
- `metadata/<outputId>.json` - replay filename and timestamp metadata

Note: the uploaded `.rrf` file itself is not persisted 🧹.

## Database Preloading 🗃️

At startup, the service preloads `yaml/item_db.yml`, `yaml/mob_db.yml`, and `yaml/skill_db.yml` with `js-yaml`. The server does not start if a database file cannot be read or parsed.

To apply the same enrichment to output files created before this feature was added, run the one-time migration:

```bash
npm run migrate:enrich-outputs
```

The migration processes `.json` files under `persisted-output/outputs`. Set `OUTPUT_STORAGE_DIR` when the persisted output directory is stored elsewhere.

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

## Testing 🧪

The project uses Jest (ESM mode via `ts-jest`) with unit tests colocated with sources as `*.test.ts`, plus [test/app.test.ts](test/app.test.ts) for full-app supertest tests.

```bash
npm test               # run all tests with coverage
npm run test:coverage  # same as above, explicit alias
```

Coverage is collected on every run and enforced at an **80% minimum** (branches, functions, lines, statements) via `coverageThreshold` in [jest.config.cjs](jest.config.cjs) - the run fails if coverage drops below that.

A static HTML coverage report is generated at `coverage/index.html` (open it in a browser) alongside `coverage/lcov.info` for CI tooling. The `coverage/` directory is gitignored.

## Scripts ▶️

- `npm run dev` - start in watch mode
- `npm run build` - compile TypeScript, copy parser assets, and regenerate Swagger docs
- `npm start` - run the compiled server
- `npm run docs:generate` - generate static Swagger/OpenAPI docs (`docs/openapi.json`, `docs/index.html`)
- `npm run migrate:enrich-outputs` - one-time enrichment migration for existing persisted outputs
- `npm test` - run the Jest test suite with coverage
- `npm run test:coverage` - alias for `npm test`
- (On hosting) nohup /opt/cpanel/ea-nodejs22/bin/node index.js & disown
