import fs from "node:fs/promises";
import path from "node:path";
import { swaggerSpec } from "../src/docs/swagger.js";

const docsDirectory = path.join(process.cwd(), "docs");
const openapiJsonPath = path.join(docsDirectory, "openapi.json");
const staticHtmlPath = path.join(docsDirectory, "index.html");

const buildStaticHtml = (specJson: string): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Replay Parser Service API Docs</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          spec: ${specJson},
          dom_id: "#swagger-ui",
        });
      };
    </script>
  </body>
</html>
`;

const generateSwaggerDocs = async (): Promise<void> => {
  await fs.mkdir(docsDirectory, { recursive: true });

  const specJson = JSON.stringify(swaggerSpec, null, 2);
  await fs.writeFile(openapiJsonPath, specJson, "utf8");
  await fs.writeFile(staticHtmlPath, buildStaticHtml(specJson), "utf8");

  console.log(
    `Generated Swagger docs:\n- ${openapiJsonPath}\n- ${staticHtmlPath}`,
  );
};

await generateSwaggerDocs();
