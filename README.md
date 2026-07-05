# Replay Parser Service

TypeScript + Express API that accepts an uploaded replay file, runs a parser through `wine`, reads `output.json`, and returns the parsed JSON to the client.

## Layout

```text
src/
├── routes/
│   └── parser.route.ts
├── services/
│   └── parser.service.ts
├── utils/
│   └── process.ts
└── temp/
```

## Environment

- `PARSER_EXE` - path to the parser `.exe`, defaults to `src/parser/RagnarokReplayExample.exe`
- `CORS_ORIGIN` - allowed frontend origin, defaults to `https://localhost:8443`
- `HTTPS_KEY_FILE` - path to the TLS private key for HTTPS startup
- `HTTPS_CERT_FILE` - path to the TLS certificate for HTTPS startup

If `HTTPS_KEY_FILE` and `HTTPS_CERT_FILE` are set, the server starts over HTTPS. Otherwise it falls back to HTTP.

For browser use, make sure the certificate is trusted locally. A common approach is to generate a localhost certificate with `mkcert` and point the two HTTPS env vars at the generated files.

## API

`POST /parse`

Form data:

Example:

```bash
curl -F "replay=@./replay.rrf" http://localhost:3000/parse
```

The parser is invoked as `RagnarokReplayExample.exe input.rrf output.json` inside a temporary job directory.

## Scripts

- `npm run dev` - start in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run the compiled server
