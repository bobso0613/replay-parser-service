import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Replay Parser Service API",
      version: "1.0.0",
      description: "API for parsing Ragnarok Online replay files.",
    },
  },
  apis: ["src/routes/*.ts", "dist/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
