import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Website Analytics API",
      version: "1.0.0",
      description: "Analytics collection and reporting API"
    }
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;